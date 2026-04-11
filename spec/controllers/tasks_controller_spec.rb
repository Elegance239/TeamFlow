require 'rails_helper'

RSpec.describe TasksController, type: :controller do
    include Devise::Test::ControllerHelpers

    let(:team) { Team.create!(name: "Test Team") }

    let(:user) { User.create!(
        email: "a@cuhk.com",
        password: "password1",
        name: "A",
        team: team,
        role: 1
    ) }

    let(:team_lead) { User.create!(
        email: "lead@cuhk.com",
        password: "password1",
        name: "Lead",
        team: team,
        role: 0
    ) }

    describe 'POST #create' do
        before { sign_in team_lead }

        it 'creates a task with a title' do
            post :create, params: { 
                title: "New Task Title", 
                description: "Task Description", 
                points: 5, 
                due_date: Date.today + 7
            }
            expect(response).to have_http_status(:created)
            expect(Task.last.title).to eq("New Task Title")
        end
    end

    describe 'PATCH #update' do
        let(:task) { Task.create!(
            title: "Original Title",
            description: "Original Desc",
            points: 1,
            due_date: Date.today,
            team: team,
            created_by: team_lead.id
        ) }

        before { sign_in team_lead }

        it 'updates the task title' do
            patch :update, params: { id: task.id, title: "Updated Title" }
            expect(response).to have_http_status(:ok)
            expect(task.reload.title).to eq("Updated Title")
        end
    end

    describe 'POST #ai_generate' do
        context 'Logged in' do
            before { sign_in user }

            it 'returns unprocessable_entity for short prompts' do
                post :ai_generate, params: { prompt: "abc" }
                expect(response).to have_http_status(:unprocessable_entity)
            end

            it 'calls Ai and returns JSON including title' do
                allow(Ai).to receive(:generate_task).and_return({ "title"=>"AI Task", "description"=>"AI Desc" })
                post :ai_generate, params: { prompt: "Build login page" }
                expect(response).to have_http_status(:ok)
                data = JSON.parse(response.body)
                expect(data["title"]).to eq("AI Task")
                expect(data["description"]).to eq("AI Desc")
            end
        end

        context 'not logged in' do
            it 'redirects to login' do
                post :ai_generate, params: { prompt: "Build login page" }
                expect(response).to have_http_status(:found) # Devise redirect
            end
        end
    end
end
