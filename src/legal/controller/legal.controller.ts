import { Controller, Post, Body } from '@nestjs/common';
import { LegalService } from '../services/legal.service'; 
import { SearchDocumentDto } from '../dto/SearchDocument.dto';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Post('search')
  async search(@Body() searchDocumentDto: SearchDocumentDto) {
    return await this.legalService.searchAndMonitor(searchDocumentDto);
  }

  @Post('searchcapa')
  async getCapa(@Body('document') document: string) {
    return await this.legalService.consultarCapaJudit(document);
  }

  @Post('searchcnj')
  async getMovimentacoes(@Body('cnj') cnj: string) {
    return await this.legalService.consultarDatajud(cnj);
  }
}