import {
  AbstractNotificationProviderService,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer from "nodemailer"
import Handlebars from "handlebars"

type NodemailerOptions = {
  from: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_pass: string
  // Optional templates configuration
  html_templates?: Record<string, {
    subject?: string
    content: string
  }>
}

type InjectedDependencies = {
  logger: Logger
}

class UkrnetNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-nodemailer"
  private transporter: nodemailer.Transporter
  private options: NodemailerOptions
  private logger: Logger

  constructor(
    { logger }: InjectedDependencies,
    options: NodemailerOptions
  ) {
    super()

    this.options = options
    this.logger = logger

    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: options.smtp_host,
      port: options.smtp_port,
      secure: true, // true for 465, false for other ports
      auth: {
        user: options.smtp_user,
        pass: options.smtp_pass,
      },
    })
  }

  // Optional: Validate options
  static validateOptions(options: Record<any, any>) {
    const requiredOptions = [
      "from",
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass"
    ]

    for (const option of requiredOptions) {
      if (!options[option]) {
        throw new Error(`${option} is required in the provider's options.`)
      }
    }
  }

  // Get template content
  private getTemplate(templateId: string): string {
    if (this.options.html_templates?.[templateId]?.content) {
      return this.options.html_templates[templateId].content
    }

    // Default template if none found
    return `<p>This is a default email template.</p>`
  }

  // Inside your service class
  private processTemplate(template: string, data: any): string {
    const compiledTemplate = Handlebars.compile(template)
    return compiledTemplate(data)
  }


  // Get template subject
  private getTemplateSubject(templateId: string): string {
    if (this.options.html_templates?.[templateId]?.subject) {
      return this.options.html_templates[templateId].subject
    }

    // Default subject if none found
    return `Notification from your store`
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    console.log(JSON.stringify(notification.data))
    const template = this.getTemplate(notification.template as string)
    const subject = this.getTemplateSubject(notification.template as string)
    const processedTemplate = this.processTemplate(template, notification.data)

    try {
      notification.data
      // Send email using nodemailer
      const info = await this.transporter.sendMail({
        from: this.options.from,
        to: notification.to,
        subject: subject,
        html: processedTemplate,
        // You can use a template engine here to render the template with data
        // For example with Handlebars:
        // html: Handlebars.compile(template)(notification.data),
      })

      this.logger.info(`Email sent: ${info.messageId}`)
      return { id: info.messageId }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`)
      return {}
    }
  }
}

export default UkrnetNotificationProviderService