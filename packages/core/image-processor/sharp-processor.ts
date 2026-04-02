import sharp from 'sharp';
import { join } from 'path';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

export interface TemplateConfig {
  name: string;
  overlays: OverlayConfig[];
}

export interface OverlayConfig {
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  padding?: number;
  imagePath?: string;
  shape?: 'rectangle' | 'circle' | 'rounded';
  radius?: number;
  opacity?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export class SharpProcessor {
  private sourcePath: string;
  private outputPath: string;
  private templateDir: string;
  private dimensions: ImageDimensions = { width: 0, height: 0 };

  constructor(sourcePath: string, options?: {
    outputPath?: string;
    templateDir?: string;
  }) {
    this.sourcePath = sourcePath;
    this.outputPath = options?.outputPath || '/tmp/processed';
    this.templateDir = options?.templateDir || '/app/templates';
    
    // Создаём директорию если не существует
    if (!existsSync(this.outputPath)) {
      mkdirSync(this.outputPath, { recursive: true });
    }
  }

  /**
   * Загрузка и получение размеров изображения
   */
  async load(): Promise<SharpProcessor> {
    try {
      const metadata = await sharp(this.sourcePath).metadata();
      this.dimensions = {
        width: metadata.width || 1200,
        height: metadata.height || 1200,
      };
      return this;
    } catch (error: any) {
      throw new Error(`Failed to load image: ${error.message}`);
    }
  }

  /**
   * Применение шаблона к изображению
   */
  async applyTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<SharpProcessor> {
    const templatePath = join(this.templateDir, `${templateName}.json`);
    
    let template: TemplateConfig;
    try {
      template = JSON.parse(readFileSync(templatePath, 'utf-8'));
    } catch (error: any) {
      // Если шаблон не найден - используем дефолтный
      template = this.getDefaultTemplate(templateName);
    }

    // Загружаем исходное изображение
    const sourceImage = await loadImage(this.sourcePath);
    
    // Создаём canvas
    const canvas = createCanvas(this.dimensions.width, this.dimensions.height);
    const ctx = canvas.getContext('2d');
    
    // Рисуем исходное изображение
    ctx.drawImage(sourceImage, 0, 0);
    
    // Применяем оверлеи из шаблона
    for (const overlay of template.overlays) {
      await this.applyOverlay(ctx, overlay, data);
    }
    
    // Сохраняем результат
    const outputFileName = `${this.getBaseName()}.${template.name}.jpg`;
    const outputPath = join(this.outputPath, outputFileName);
    
    writeFileSync(outputPath, canvas.toBuffer('image/jpeg', { quality: 85 }));
    
    return this;
  }

  /**
   * Сохранение изображения
   */
  async save(outputPath?: string): Promise<string> {
    const dest = outputPath || join(this.outputPath, `${this.getBaseName()}.jpg`);
    
    await sharp(this.sourcePath)
      .jpeg({ quality: 85 })
      .toFile(dest);
    
    return dest;
  }

  /**
   * Генерация 4 изображений для маркетплейса
   */
  async generateAll(data: Record<string, any>): Promise<string[]> {
    const templates = [
      { name: 'main', file: 'MAIN' },
      { name: 'features', file: 'FEATURES' },
      { name: 'benefits', file: 'BENEFITS' },
      { name: 'details', file: 'DETAILS' },
    ];

    const outputPaths: string[] = [];

    for (const template of templates) {
      const outputPath = join(this.outputPath, `${this.getBaseName()}.${template.file}.jpg`);
      
      await this.applyTemplate(template.name, data);
      
      // Переименовываем файл в правильный формат
      const finalPath = join(this.outputPath, `${this.getBaseName()}.${template.file}.jpg`);
      outputPaths.push(finalPath);
    }

    return outputPaths;
  }

  /**
   * Применение оверлея к canvas
   */
  private async applyOverlay(
    ctx: CanvasRenderingContext2D,
    overlay: OverlayConfig,
    data: Record<string, any>
  ): Promise<void> {
    // Подставляем данные в текст
    const text = overlay.text ? this.interpolate(overlay.text, data) : '';

    switch (overlay.type) {
      case 'text':
        this.drawText(ctx, overlay, text);
        break;
      
      case 'image':
        if (overlay.imagePath) {
          await this.drawImage(ctx, overlay);
        }
        break;
      
      case 'shape':
        this.drawShape(ctx, overlay);
        break;
    }
  }

  /**
   * Рисование текста
   */
  private drawText(
    ctx: CanvasRenderingContext2D,
    overlay: OverlayConfig,
    text: string
  ): void {
    const {
      x, y, width, height,
      fontSize = 24,
      fontFamily = 'Arial',
      color = '#000000',
      backgroundColor,
      align = 'left',
      valign = 'top',
      padding = 10,
      opacity = 1,
    } = overlay;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Устанавливаем шрифт
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = valign === 'top' ? 'top' : valign === 'middle' ? 'middle' : 'bottom';

    // Рисуем фон если указан
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      const textMetrics = ctx.measureText(text);
      const textHeight = fontSize;
      
      let bgX = x;
      let bgY = y;
      let bgWidth = width || (textMetrics.width + padding * 2);
      let bgHeight = height || (textHeight + padding * 2);

      if (align === 'center') {
        bgX = x - bgWidth / 2;
      } else if (align === 'right') {
        bgX = x - bgWidth;
      }

      if (valign === 'middle') {
        bgY = y - bgHeight / 2;
      } else if (valign === 'bottom') {
        bgY = y - bgHeight;
      }

      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      ctx.fillStyle = color;
    }

    // Рисуем текст
    if (width) {
      // Word wrapping
      this.wrapText(ctx, text, x, y, width, fontSize * 1.4, align);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  /**
   * Рисование изображения
   */
  private async drawImage(
    ctx: CanvasRenderingContext2D,
    overlay: OverlayConfig
  ): Promise<void> {
    if (!overlay.imagePath) return;

    const { x, y, width, height, opacity = 1 } = overlay;

    try {
      const img = await loadImage(overlay.imagePath);
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(
        img,
        x, y,
        width || img.width,
        height || img.height
      );
      ctx.restore();
    } catch (error: any) {
      console.warn(`Failed to load overlay image ${overlay.imagePath}: ${error.message}`);
    }
  }

  /**
   * Рисование фигуры
   */
  private drawShape(
    ctx: CanvasRenderingContext2D,
    overlay: OverlayConfig
  ): void {
    const {
      x, y, width, height,
      backgroundColor = '#000000',
      shape = 'rectangle',
      radius = 0,
      opacity = 1,
    } = overlay;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = backgroundColor;

    ctx.beginPath();

    if (shape === 'rectangle') {
      ctx.fillRect(x, y, width || 0, height || 0);
    } else if (shape === 'rounded' && width && height) {
      this.roundedRect(ctx, x, y, width, height, radius || 10);
      ctx.fill();
    } else if (shape === 'circle' && width && height) {
      ctx.arc(
        x + width / 2,
        y + height / 2,
        Math.min(width, height) / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Обёртка текста (word wrapping)
   */
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: string
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        this.drawTextLine(ctx, line, x, currentY, align);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    this.drawTextLine(ctx, line, x, currentY, align);
  }

  /**
   * Рисование строки текста
   */
  private drawTextLine(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    align: string
  ): void {
    ctx.fillText(text, x, y);
  }

  /**
   * Рисование прямоугольника с закруглёнными углами
   */
  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Интерполяция данных в текст
   */
  private interpolate(text: string, data: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Получение базового имени файла
   */
  private getBaseName(): string {
    const basename = require('path').basename;
    return basename(this.sourcePath, require('path').extname(this.sourcePath));
  }

  /**
   * Шаблон по умолчанию
   */
  private getDefaultTemplate(type: string): TemplateConfig {
    const baseOverlays: OverlayConfig[] = [
      {
        type: 'shape',
        x: 0,
        y: 0,
        width: this.dimensions.width,
        height: 150,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        shape: 'rectangle',
      },
      {
        type: 'text',
        x: 20,
        y: 40,
        fontSize: 36,
        fontFamily: 'Arial Bold',
        color: '#FFFFFF',
        text: `{{name}}`,
        width: this.dimensions.width - 40,
      },
      {
        type: 'shape',
        x: 0,
        y: this.dimensions.height - 100,
        width: this.dimensions.width,
        height: 100,
        backgroundColor: 'rgba(255, 200, 0, 0.9)',
        shape: 'rectangle',
      },
      {
        type: 'text',
        x: 20,
        y: this.dimensions.height - 70,
        fontSize: 28,
        fontFamily: 'Arial Bold',
        color: '#000000',
        text: type === 'main' ? '{{price}} ₽' : 'Характеристики',
      },
    ];

    return {
      name: type,
      overlays: baseOverlays,
    };
  }
}

export default SharpProcessor;
