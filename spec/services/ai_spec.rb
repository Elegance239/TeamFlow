require 'rails_helper'

RSpec.describe Ai do
    describe '.generate_task' do
        let(:prompt) { "Finish tests for dashboard ui" }
        let(:api_key) { "fake_key" }

        before do
            allow(ENV).to receive(:[]).with('GEMINI_API_KEY').and_return(api_key)
            allow(ENV).to receive(:[]).and_call_original
        end

        # api not set
        it 'returns error if GEMINI_API_KEY is not set' do
            allow(ENV).to receive(:[]).with('GEMINI_API_KEY').and_return(nil)

            result=Ai.generate_task(prompt)
            expect(result[:error]).to eq("Missing API Key")
        end
    end
end
