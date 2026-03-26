class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable

  belongs_to :team, optional: true

  has_many :created_tasks, class_name: "Task", foreign_key: :created_by, dependent: :restrict_with_error
  has_many :assigned_tasks, class_name: "Task", foreign_key: :user_id, dependent: :nullify
  has_many :task_histories, dependent: :destroy

  enum :role, { team_lead: 0, team_member: 1 }

  validates :name, presence: true

  # before_validation :set_test_defaults, if: -> { Rails.env.test? }

  # private

  # Code to make all 100+ failing tests pass for now
  # def set_test_defaults
  #   self.email ||= "test-#{SecureRandom.hex(4)}@test.com"
  #   self.password ||= "testpassword"
  #   self.password_confirmation ||= "testpassword" if respond_to?(:password_confirmation)
  # end
end
