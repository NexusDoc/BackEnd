import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API);
  }
  async sendResetPasswordEmail(
    to: string,
    name: string,
    link: string,
  ) {
    try {
      await this.resend.emails.send({
        from: 'NexusDoc <contato@nexusdoc.org>',
        to,
        subject: 'Redefinição de senha - NexusDoc',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
            
            <h2>Olá, ${name} 👋</h2>
  
            <p>
              Recebemos sua solicitação para redefinição de senha.
            </p>
  
            <p>
              Para continuar, clique no botão abaixo:
            </p>
  
            <p style="text-align: center; margin: 30px 0;">
              <a href="${link}"
                 style="
                   background-color: #2563eb;
                   color: #ffffff;
                   padding: 12px 24px;
                   text-decoration: none;
                   border-radius: 6px;
                   font-weight: bold;
                   display: inline-block;
                 ">
                Clique aqui para redefinir sua senha
              </a>
            </p>
  
            <p>
              Este link expira em <strong>15 minutos</strong>.
            </p>
  
            <p>
              Se você não solicitou esta alteração, ignore este e-mail.
            </p>
  
            <br>
  
            <p>
              Abraços,<br>
              <strong>Equipe NexusDoc</strong>
            </p>
  
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
  
            <p style="font-size: 12px; color: #888; text-align: center;">
              © 2026 NexusDoc: Todos os direitos reservados.
            </p>
  
          </div>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new InternalServerErrorException(
        'Erro ao enviar e-mail.',
      );
    }
  }
}