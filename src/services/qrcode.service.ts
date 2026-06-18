import QRCode from 'qrcode';
import { AppError } from '../errors/app-error';

export class QRCodeService {
  private domainBase: string;

  constructor(domainBase: string = process.env.APP_URL || 'http://localhost:3000') {
    this.domainBase = domainBase;
  }

  /**
   * Gera um QR Code para um dente em formato PNG
   * @param codigoRastreio - Código de rastreio do dente
   * @returns Buffer com a imagem PNG do QR Code
   */
  async gerarQRCodePNG(codigoRastreio: string): Promise<Buffer> {
    try {
      const url = `${this.domainBase}/consulta?codigo=${codigoRastreio}`;
      const qrCodeBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new AppError('Erro ao gerar QR Code', 500);
    }
  }

  /**
   * Gera um QR Code em formato Base64
   * @param codigoRastreio - Código de rastreio do dente
   * @returns String com o QR Code em Base64
   */
  async gerarQRCodeBase64(codigoRastreio: string): Promise<string> {
    try {
      const url = `${this.domainBase}/consulta?codigo=${codigoRastreio}`;
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new AppError('Erro ao gerar QR Code em Base64', 500);
    }
  }
}
