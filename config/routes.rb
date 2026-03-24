Rails.application.routes.draw do
  get "welcome/index"

  # Not sure how to fix the hash argument warning, docs asked to do so this way:
  # devise_for :users, controllers: { sessions: "users/sessions" },
  # https://www.rubydoc.info/github/plataformatec/devise/ActionDispatch%2FRouting%2FMapper:devise_for

  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations", passwords: "users/passwords" }

  resources :users, only: [ :create, :show, :update ]

  resources :teams, only: [ :create, :show, :update ] do
    resources :members, only: [ :create, :index, :destroy ], controller: "team_members"
  end

  resources :tasks, only: [ :index, :show, :create, :update, :destroy ] do
    member do
      post   :assign
      delete :unassign
    end
    resources :task_steps, only: [ :index, :show ]
  end

  get "up" => "rails/health#show", as: :rails_health_check

  root "welcome#index"
end
