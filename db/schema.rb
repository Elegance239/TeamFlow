# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_11_145000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "task_histories", force: :cascade do |t|
    t.date "start_date", null: false
    t.bigint "task_id", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "task_id"], name: "index_task_histories_on_user_id_and_task_id"
  end

  create_table "task_transition_pendings", force: :cascade do |t|
    t.bigint "approved_by_id", null: false
    t.datetime "created_at", null: false
    t.string "from_state", null: false
    t.bigint "requested_by_id", null: false
    t.string "status", default: "pending", null: false
    t.bigint "task_id", null: false
    t.string "to_state", null: false
    t.datetime "updated_at", null: false
    t.index ["approved_by_id"], name: "index_task_transition_pendings_on_approved_by_id"
    t.index ["requested_by_id"], name: "index_task_transition_pendings_on_requested_by_id"
    t.index ["task_id", "status"], name: "index_task_transition_pendings_on_task_id_and_status"
    t.index ["task_id"], name: "index_task_transition_pendings_on_task_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.text "all_states", default: "UNASSIGNED,ASSIGNED,COMPLETED", null: false
    t.bigint "completed_by_id"
    t.datetime "created_at", null: false
    t.bigint "created_by", null: false
    t.string "current_state", default: "UNASSIGNED", null: false
    t.text "description"
    t.date "due_date", null: false
    t.boolean "needs_validation", default: false, null: false
    t.integer "points", null: false
    t.text "required_skills", default: "", null: false
    t.bigint "team_id", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["completed_by_id"], name: "index_tasks_on_completed_by_id"
    t.index ["created_by"], name: "index_tasks_on_created_by"
    t.index ["current_state"], name: "index_tasks_on_current_state"
    t.index ["team_id"], name: "index_tasks_on_team_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
    t.check_constraint "points > 0", name: "check_tasks_points_positive"
  end

  create_table "teams", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_teams_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.string "encrypted_password"
    t.string "name", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role"
    t.text "skills"
    t.bigint "team_id"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["team_id"], name: "index_users_on_team_id"
  end

  add_foreign_key "task_histories", "tasks"
  add_foreign_key "task_histories", "users"
  add_foreign_key "task_transition_pendings", "tasks"
  add_foreign_key "task_transition_pendings", "users", column: "approved_by_id"
  add_foreign_key "task_transition_pendings", "users", column: "requested_by_id"
  add_foreign_key "tasks", "teams"
  add_foreign_key "tasks", "users"
  add_foreign_key "tasks", "users", column: "completed_by_id"
  add_foreign_key "tasks", "users", column: "created_by"
  add_foreign_key "users", "teams"
end
