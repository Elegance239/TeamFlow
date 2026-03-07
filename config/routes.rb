Rails.application.routes.draw do
  get "welcome/index"

  resources :users, only: [:create, :show, :update]

  resources :teams, only: [:create, :show, :update] do
    resources :members, only: [:create, :index, :destroy], controller: "team_members"
  end

  get "up" => "rails/health#show", as: :rails_health_check

  root "welcome#index"
end
