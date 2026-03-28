class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable

  belongs_to :team

  has_many :created_tasks, class_name: "Task", foreign_key: :created_by, dependent: :restrict_with_error
  has_many :assigned_tasks, class_name: "Task", foreign_key: :user_id, dependent: :nullify
  has_many :completed_tasks, class_name: "Task", foreign_key: :completed_by_id, dependent: :nullify
  has_many :task_histories, dependent: :destroy

  enum :role, { team_lead: 0, team_member: 1 }

  validates :name, presence: true
  validates :team, presence: true
  before_validation :normalize_skills

  def skills_list
    normalize_skill_values(skills)
  end

  def overall_score
    completed_tasks.sum(:points)
  end

  # before_validation :set_test_defaults, if: -> { Rails.env.test? }

  # private

  # Code to make all 100+ failing tests pass for now
  # def set_test_defaults
  #   self.email ||= "test-#{SecureRandom.hex(4)}@test.com"
  #   self.password ||= "testpassword"
  #   self.password_confirmation ||= "testpassword" if respond_to?(:password_confirmation)
  # end

  private

  def normalize_skills
    self.skills = normalize_skill_values(skills).join(",")
  end

  def normalize_skill_values(raw_value)
    values = if raw_value.is_a?(Array)
      raw_value
    else
      raw_value.to_s.split(",")
    end

    values
      .map { |value| value.to_s.strip.downcase }
      .reject(&:blank?)
      .uniq
  end
end
