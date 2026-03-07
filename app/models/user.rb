class User < ApplicationRecord
  belongs_to :team, optional: true

  has_many :created_tasks, class_name: "Task", foreign_key: :created_by, dependent: :restrict_with_error
  has_many :assigned_tasks, class_name: "Task", foreign_key: :user_id, dependent: :nullify
  has_many :task_histories, dependent: :destroy

  enum :role, { team_lead: 0, team_member: 1 }

  validates :name, presence: true
end
