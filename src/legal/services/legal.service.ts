import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentSearch } from '../entities/DocumentSearch.entity';
import { Process } from '../entities/process.entity'; 
import { User } from '../../users/entities/users.entity';
import { SearchDocumentDto } from '../dto/SearchDocument.dto';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class LegalService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  private readonly iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex');

  constructor(
    @InjectRepository(DocumentSearch)
    private readonly docRepo: Repository<DocumentSearch>,
    @InjectRepository(Process)
    private readonly processRepo: Repository<Process>, 
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private getTribunalAlias(cnj: string): string {
    
    if (cnj.includes('.4.03.')) return 'api_publica_trf3';
    if (cnj.includes('.8.26.')) return 'api_publica_tjsp';
    return 'api_publica_trf3'; 
  }

  async consultarDatajud(cnj: string) {
    const alias = this.getTribunalAlias(cnj);
    const url = `https://api-publica.datajud.cnj.jus.br/${alias}/_search`;
    const apiKey = (process.env.DATAJUD_API_KEY || '').trim();

    try {
      const body = {
        "query": { 
          "match": { "numeroProcesso": cnj.replace(/\D/g, '') } 
        }
      };

      const response = await axios.post(url, body, {
        headers: { 
          'Authorization': `APIKey ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'NexusDoc/1.0'
        },
        timeout: 30000 
      });

      return response.data.hits?.hits[0]?._source || null;
    } catch (error) {
      console.error(`[Datajud Error] Falha ao consultar CNJ ${cnj}: ${error.message}`);
      return null;
    }
  }
  
  async searchAndMonitor(dto: SearchDocumentDto) {
    const { document, email, foundProcesses } = dto;
    const cleanDoc = document.replace(/\D/g, '');
    const docHash = crypto.createHash('sha256').update(cleanDoc).digest('hex');

    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['monitoredDocuments'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    let search = await this.docRepo.findOne({
      where: { document_hash: docHash },
      relations: ['processes'],
    });

    if (foundProcesses && foundProcesses.length > 0) {
      if (!search) {
        search = this.docRepo.create({
          document_hash: docHash,
          encrypted_document: this.encrypt(cleanDoc),
          type: cleanDoc.length <= 11 ? 'CPF' : 'CNPJ',
          processes: foundProcesses.map(cnj => ({ 
            cnj_number: cnj, 
            court: 'Busca NexusDoc' 
          })),
        });
      } else {
        const currentSearch = search;
        const novosCnjs = foundProcesses.filter(
          cnj => !currentSearch.processes.some(p => p.cnj_number === cnj)
        );

        if (novosCnjs.length > 0) {
          const novosProcessos = novosCnjs.map(cnj => 
            this.processRepo.create({ 
              cnj_number: cnj, 
              court: 'Busca NexusDoc', 
              documentSearch: currentSearch 
            })
          );
          await this.processRepo.save(novosProcessos);
        }
      }

      search = await this.docRepo.save(search!);
      await this.vincularSeNaoExistir(user, search);

      const results = await Promise.all(foundProcesses.map(cnj => this.consultarDatajud(cnj)));
      return { 
        status: 'SUCCESS_SYNC', 
        details: results.filter(r => r !== null) 
      };
    }

    if (search && search.processes.length > 0) {
      await this.vincularSeNaoExistir(user, search);
      const results = await Promise.all(search.processes.map(p => this.consultarDatajud(p.cnj_number)));
      return { 
        status: 'FROM_CACHE', 
        document: this.decrypt(search.encrypted_document), 
        details: results.filter(r => r !== null) 
      };
    }

    return { status: 'NOT_FOUND', message: 'Nada encontrado.' };
  }

  private async vincularSeNaoExistir(user: User, search: DocumentSearch) {
    const isAlreadyMonitored = user.monitoredDocuments.some(doc => doc.id === search.id);
    if (!isAlreadyMonitored) {
      user.monitoredDocuments.push(search);
      await this.userRepo.save(user);
    }
  }

  async consultarCapaJudit(cpf: string) {
    const apiKey = process.env.JUDIT_API_KEY || "485f54dd-73a1-4c25-8201-c26b9d1576a7";
    const headers = { "api-key": apiKey, "Content-Type": "application/json" };
  
    try {
      const resPost = await axios.post("https://requests.prod.judit.io/requests", {
        search: { search_type: "cpf", search_key: cpf.replace(/\D/g, '') }
      }, { headers });
  
      const requestId = resPost.data.request_id;
      if (!requestId) return { error: "Não foi possível gerar ID de busca" };

      
      let completed = false;
      let dadosCapa = null;
      let tentativas = 0;
      while (!completed && tentativas < 15) { // Aumentei um pouco as tentativas por segurança
        const resGet = await axios.get(`https://requests.prod.judit.io/responses?request_id=${requestId}`, { headers });
        const data = resGet.data;
        
        // A Judit às vezes responde um objeto direto ou um array de respostas
        const responseObj = Array.isArray(data) ? data[0] : data;
        const status = (responseObj?.request_status || '').toUpperCase();

        if (status === "COMPLETED") {
          // Ajuste crucial: Tenta pegar o page_data da raiz ou do objeto de resposta
          // Conforme seu exemplo, ele está dentro do array raiz
          dadosCapa = data.page_data || responseObj.page_data || responseObj;
          completed = true;
        } else if (status === "FAILED") {
          return { error: "Busca na Judit falhou" };
        } else {
          tentativas++;
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } 
      
      return dadosCapa;
    } catch (error) {
      return { error: error.message };
    }
  }
}