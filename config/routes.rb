Rails.application.routes.draw do
  get "welcome/index"

  # Not sure how to fix the hash argument warning, docs asked to do so this way:
  # devise_for :users, controllers: { sessions: "users/sessions" },
  # https://www.rubydoc.info/github/plataformatec/devise/ActionDispatch%2FRouting%2FMapper:devise_for

  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations", passwords: "users/passwords" }

  resources :users, only: [ :show, :update ]

  resources :teams, only: [ :create, :show, :update ] do
    resources :members, only: [ :create, :index, :destroy ], controller: "team_members"
  end

  resources :tasks, only: [ :index, :show, :create, :update, :destroy ] do
    collection do
      get :scores
    end

    member do
      post   :assign
      post   :progress
      delete :unassign
    end
  end

  resources :task_transition_pendings, only: [ :index ] do
    member do
      post :approve
      post :reject
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  root "welcome#index"
end
