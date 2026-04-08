# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  team = Team.create!(name: "Test Team")
  @user = User.create!(
    name: name,
    email: "chris@example.com",
    role: "team_member",
    skills: [ "React", "CSS" ],
    password: "password123",
    password_confirmation: "password123",
    team: team
    )
  visit "/"
  fill_in "Email", with: "chris@example.com"
  fill_in "Password", with: "password123"
  click_button "Sign in"
end

Given('I open the side menu') do
  click_button 'open drawer'
end

When('I click the {string} button') do |button_text|
  id_candidate = button_text.downcase.gsub(' ', '-') + "-button"
  begin
    find("##{id_candidate}", wait: 10).click
  rescue Capybara::ElementNotFound, Capybara::Ambiguous
    find_button(button_text, wait: 10).click
  end
end

Then('I should see {string} within the skill tags') do |skill|
  expect(page).to have_css('.skill-tag', text: skill)
end

Then('I should see {string} as my role') do |role_text|
  expect(page).to have_selector("input[value='#{role_text}']", visible: true)
end

Given('a team exists named {string}') do |team_name|
  Team.find_or_create_by!(name: team_name)
end

Given('I am logged in as a team lead') do
  team = Team.find_or_create_by!(name: "Testing Team")
  @user = User.find_or_create_by!(email: "lead@example.com") do |u|
    u.name = "Lead User"
    u.password = "password123"
    u.role = :team_lead
    u.team = team
  end
  visit "/"
  fill_in "Email", with: "lead@example.com"
  fill_in "Password", with: "password123"
  click_button "Sign in"
  # Inject user into localStorage so React's getStoredUser() works in test env
  user_json = { id: @user.id, email: @user.email, role: @user.role, name: @user.name,
                team_id: @user.team_id, skills: @user.skills }.to_json
  execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
end

Given('I am logged in as a normal team member') do
  team = Team.find_or_create_by!(name: "Testing Team")
  @user = User.find_or_create_by!(email: "member@example.com") do |u|
    u.name = "Member User"
    u.password = "password123"
    u.role = :team_member
    u.team = team
  end
  visit "/"
  fill_in "Email", with: "member@example.com"
  fill_in "Password", with: "password123"
  click_button "Sign in"
  user_json = { id: @user.id, email: @user.email, role: @user.role, name: @user.name,
                team_id: @user.team_id, skills: @user.skills }.to_json
  execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
end

When('I click the {string} link') do |link_text|
  begin
    click_link link_text
  rescue Capybara::ElementNotFound
    find('span, p, a', text: link_text).click
  end
end

When('I fill in {string} with {string}') do |field, value|
  fill_in field, with: value
end

Then('I should see the text {string}') do |text|
  expect(page).to have_content(text, wait: 15)
end

When('I log out') do
  find('button[aria-label="account of current user"]').click
  find('li', text: 'Log Out', match: :first).click
end

Given('I refresh the page') do
  visit current_path
  if @user
    user_json = { id: @user.id, email: @user.email, role: @user.role, name: @user.name,
                  team_id: @user.team_id, skills: @user.skills }.to_json
    execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
    visit current_path
  end
end

Given('a user exists with email {string} and password {string}') do |email, password|
  User.where(email: email).destroy_all
  @user = User.create!(
    email: email,
    password: password,
    password_confirmation: password,
    name: "Member",
    role: "team_member",
    team: Team.first
  )
end
