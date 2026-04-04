require 'rails_helper'

RSpec.describe TasksController, type: :controller do
    describe 'POST #ai_generate' do
        
        it 'returns unprocessable_entity for short prompts' do
            post :ai_generate, params:{prompt:"abc"}
            expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'calls Ai and returns JSON' do
            allow(Ai).to receive(:generate_task).and_return({"title"=>"AI Task"})
            post :ai_generate, params:{prompt:"Build login page"}
            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)["title"]).to eq("AI Task")
        end
    end
end