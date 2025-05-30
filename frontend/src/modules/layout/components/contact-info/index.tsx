import React from "react"

const ContactInfo = () => {
  const phone = process.env.SHOP_PHONE
  const email = process.env.SHOP_MAIL

  return (
    <div className="header-info">
      <div className="header-info__item">
        <div className="header-info__icon">
          <span>📞</span>
          <a href={`tel:${phone}`}>{phone}</a>
        </div>
      </div>
      <div className="header-info__item">
        <div className="header-info__icon header-info__icon--email">
          <span>✉️</span>
          <a data-testid="Email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo
