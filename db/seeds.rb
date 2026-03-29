# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

team = Team.find_or_create_by!(name: "Group 25") do |t|
  t.description = "Main development team"
end

User.find_or_create_by!(email: "testing@testing.com") do |u|
  u.name = "Admin User"
  u.password = "testing"
  u.password_confirmation = "testing"
  u.role = 0
  u.team = team
end

User.find_or_create_by!(email: "user@testing.com") do |u|
  u.name = "Regular User"
  u.password = "testing"
  u.password_confirmation = "testing"
  u.role = 1
  u.team = team
end