import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface SignInPromptProps {
  dict: {
    SignInPrompt: {
      alreadyHaveAnAccount: string;
      signInForBetterExperience: string;
      signIn: string;
    };
  };
}

const SignInPrompt = ({ dict }: SignInPromptProps) => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {dict.SignInPrompt.alreadyHaveAnAccount}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {dict.SignInPrompt.signInForBetterExperience}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            className="h-10"
            data-testid="sign-in-button"
          >
            {dict.SignInPrompt.signIn}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
