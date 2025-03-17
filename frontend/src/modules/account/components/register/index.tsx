"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  dict: {
    Register: {
      becomeABolagroMember: string
      createMemberProfile: string
      firstName: string
      lastName: string
      email: string
      phone: string
      password: string
      agreeToStoreRules: string
      privacyPolicy: string
      and: string
      termsOfUse: string
      join: string
      alreadyAMember: string
      signIn: string
    }
  }
}

const Register = ({ setCurrentView, dict }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        {dict.Register.becomeABolagroMember}
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        {dict.Register.createMemberProfile}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={dict.Register.firstName}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={dict.Register.lastName}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={dict.Register.email}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={dict.Register.phone}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={dict.Register.password}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          {dict.Register.agreeToStoreRules}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {dict.Register.privacyPolicy}
          </LocalizedClientLink>{" "}
          {dict.Register.and}{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {dict.Register.termsOfUse}
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {dict.Register.join}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {dict.Register.alreadyAMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {dict.Register.signIn}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
