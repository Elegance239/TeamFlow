# features/step_definitions/team_steps.rb

Given('I am on the signup page') do
  visit "/"

  expect(page).to have_content("Sign in")
  click_button "Sign up"
end

Then('I should be on the signin page') do
  expect(page).to have_content("Sign in")
end

When('I choose {string} from {string}') do |option, _label|
  find('label', text: option).click
end

When('I choose {string}') do |option|
  find('label', text: option).click
end

When('I log in with email {string} and password {string}') do |email, password|
  fill_in "email", with: email
  fill_in "password", with: password
  click_button "Sign in"
  db_user = User.find_by(email: email)
  if db_user
    user_json = { id: db_user.id, email: db_user.email, role: db_user.role,
                  name: db_user.name, team_id: db_user.team_id, skills: db_user.skills }.to_json
    execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
  end
end

When('I open the drawer') do
  find('button[aria-label="open drawer"]').click
end

Then('I should see {string} as the team name in the drawer') do |team_name|
  within('.MuiDrawer-paper') do
    expect(page).to have_content(team_name)
  end
end
