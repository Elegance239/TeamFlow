require 'rails_helper'

RSpec.describe Ai do
    describe '.generate_task' do
        let(:prompt) { "Finish tests for dashboard ui" }
        let(:api_key) { "fake_key" }

        before do
            allow(ENV).to receive(:[]).and_call_original
            allow(ENV).to receive(:[]).with('GEMINI_API_KEY').and_return(api_key)
    end

        it 'returns a task  when API succeeds' do
            fake_response=instance_double(Net::HTTPOK)
            allow(fake_response).to receive(:body).and_return({
            candidates: [ { content: { parts: [ { 
                text: '{"title":"Finish tests", "description": "Ensure code coverage is high", "points": 10, "required_skills": "ruby, rspec", "due_days_from_now": 3}' 
            } ] } } ]
            }.to_json)

            allow(fake_response).to receive(:is_a?).with(Net::HTTPSuccess).and_return(true)
            allow(Net::HTTP).to receive(:post).and_return(fake_response)

            result = Ai.generate_task(prompt)
            expect(result["title"]).to eq("Finish tests for dashboard UI")
            expect(result["description"]).to eq("Ensure code coverage is high")
            expect(result["points"]).to eq(10)
            expect(result["required_skills"]).to eq("ruby, rspec")
            expect(result["due_days_from_now"]).to eq(3)
        end

        # api failure

        it 'returns error when API returns 400/500' do
            fake_response=instance_double(Net::HTTPBadRequest, code: "400", body: "Bad Request")
            allow(fake_response).to receive(:is_a?).with(Net::HTTPSuccess).and_return(false)

            allow(Net::HTTP).to receive(:post).and_return(fake_response)

            result=Ai.generate_task(prompt)
            expect(result[:error]).to eq("API Request Failed")
        end

        # api not set
        it 'returns error if GEMINI_API_KEY is not set' do
            allow(ENV).to receive(:[]).with('GEMINI_API_KEY').and_return(
                nil)

            result=Ai.generate_task(prompt)
            expect(result[:error]).to eq("Missing API Key")
        end
    end
end
