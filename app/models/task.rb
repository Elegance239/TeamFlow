class Task < ApplicationRecord
  UNASSIGNED = "UNASSIGNED".freeze
  ASSIGNED = "ASSIGNED".freeze
  DEVELOPMENT = "DEVELOPMENT".freeze
  TESTING = "TESTING".freeze
  PRODUCTION = "PRODUCTION".freeze
  COMPLETED = "COMPLETED".freeze

  WORKFLOW_ORDER = [ UNASSIGNED, ASSIGNED, DEVELOPMENT, TESTING, PRODUCTION, COMPLETED ].freeze
  OPTIONAL_WORKFLOW_STATES = [ DEVELOPMENT, TESTING, PRODUCTION ].freeze

  belongs_to :team
  belongs_to :creator, class_name: "User", foreign_key: :created_by
  belongs_to :assigned_user, class_name: "User", foreign_key: :user_id, optional: true
  belongs_to :completed_by, class_name: "User", foreign_key: :completed_by_id, optional: true

  has_many :task_histories, dependent: :destroy
  has_many :task_transition_pendings, dependent: :destroy

  validates :due_date, presence: true
  validates :points, presence: true, numericality: { only_integer: true, greater_than: 0 }

  before_validation :normalize_required_skills, on: :create
  before_validation :normalize_all_states, on: :create
  before_validation :set_initial_current_state, on: :create

  validate :due_date_not_in_past, on: :create
  validate :required_skills_immutable, on: :update
  validate :all_states_immutable, on: :update
  validate :assigned_user_skills_match_required_skills
  validate :workflow_states_valid

  scope :with_score_for_user, ->(user_id) {
    quoted_id = connection.quote(user_id)
    select("tasks.*, CASE WHEN tasks.completed_by_id = #{quoted_id} THEN tasks.points ELSE 0 END AS user_score")
  }

  def required_skills_list
    normalize_skill_values(required_skills)
  end

  def assign_to!(user)
    update!(user_id: user.id, current_state: ASSIGNED)
  end

  def unassign!
    update!(user_id: nil, current_state: UNASSIGNED)
  end

  def request_progress!(requested_by:)
    next_state = next_progress_state
    raise ArgumentError, "Task cannot be progressed further" if next_state.nil?

    if needs_validation
      task_transition_pendings.create!(
        requested_by: requested_by,
        approved_by: creator,
        from_state: current_state,
        to_state: next_state,
        status: "pending"
      )
      :pending
    else
      apply_progress_transition!(to_state: next_state, completed_user: requested_by)
      :applied
    end
  end

  def apply_approved_transition!(to_state:, requested_by:)
    apply_progress_transition!(to_state: to_state, completed_user: requested_by)
  end

  def next_progress_state
    return nil if current_state == UNASSIGNED || current_state == COMPLETED

    workflow = all_states_list
    idx = workflow.index(current_state)
    return nil if idx.nil?

    workflow[idx + 1]
  end



  def normalize_required_skills
    self.required_skills = normalize_skill_values(required_skills).join(",")
  end

  def normalize_all_states
    requested_states = normalize_state_values(all_states)
    optional_states = OPTIONAL_WORKFLOW_STATES.select { |state_name| requested_states.include?(state_name) }
    self.all_states = ([ UNASSIGNED, ASSIGNED ] + optional_states + [ COMPLETED ]).join(",")
  end

  def all_states_list
    normalize_state_values(all_states)
  end

  def set_initial_current_state
    self.current_state = user_id.present? ? ASSIGNED : UNASSIGNED
  end

  def required_skills_immutable
    return unless will_save_change_to_required_skills?

    errors.add(:required_skills, "cannot be changed after task creation")
  end

  def all_states_immutable
    return unless will_save_change_to_all_states?

    errors.add(:all_states, "cannot be changed after task creation")
  end

  def assigned_user_skills_match_required_skills
    return if assigned_user.blank?

    missing_skills = required_skills_list - assigned_user.skills_list
    return if missing_skills.empty?

    errors.add(:assigned_user, "is missing required skills: #{missing_skills.join(', ')}")
  end

  def workflow_states_valid
    states = all_states_list
    expected_sequence = WORKFLOW_ORDER.select { |state_name| states.include?(state_name) }

    if states != expected_sequence || !states.include?(UNASSIGNED) || !states.include?(ASSIGNED) || !states.include?(COMPLETED)
      errors.add(:all_states, "must follow workflow order and include UNASSIGNED, ASSIGNED, COMPLETED")
    end

    errors.add(:current_state, "must be included in all_states") unless states.include?(current_state)
  end

  def apply_progress_transition!(to_state:, completed_user:)
    expected_state = next_progress_state
    raise ArgumentError, "Invalid transition" unless expected_state == to_state

    self.current_state = to_state
    self.completed_by = completed_user if to_state == COMPLETED
    save!
  end

  def normalize_skill_values(raw_value)
    raw_value.to_s
      .split(",")
      .map { |value| value.strip.downcase }
      .reject(&:blank?)
      .uniq
  end

  def normalize_state_values(raw_value)
    raw_value.to_s
      .split(",")
      .map { |value| value.strip.upcase }
      .reject(&:blank?)
      .uniq
      .select { |state_name| WORKFLOW_ORDER.include?(state_name) }
  end

  private

  def due_date_not_in_past
    return unless due_date.present?
    errors.add(:due_date, "cannot be in the past") if due_date < Date.today
  end

end
