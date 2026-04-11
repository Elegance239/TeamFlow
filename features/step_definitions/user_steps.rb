# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  team = Team.create!(name: "Test Team")
  @user = User.create!(
    name: name,
    email: "chris@example.com",
    role: "team_member",
    skills: "React,CSS",
    password: "password123",
    password_confirmation: "password123",
    team: team
  )
  begin
    visit "/"
    # Wait for React app to load and show the SignIn form using existing HTML IDs
    find('input#email', wait: 15).fill_in(with: "chris@example.com")
    find('input#password').fill_in(with: "password123")
    find('button[type="submit"]', text: "Sign in").click
    
    # Ensure login completed and we navigate to the dashboard
    expect(page).to have_css('button[aria-label="add-task"]', wait: 15)
  rescue Capybara::ElementNotFound => e
    puts "DEBUG: Login failed. Current URL: #{page.current_url}"
    puts "DEBUG: Page root testid exists? #{page.has_css?('[data-testid=\"root-mount\"]')}"
    puts "DEBUG: Page Source:\n#{page.html}"
    raise e
  end
end

When('I click the {string} menu item') do |item_text|
  find('button[aria-label="open drawer"]').click
  sleep 1
  find('span.MuiListItemText-primary', text: item_text).click
end

Then('I should see {string} within the skill tags') do |skill|
  expect(page).to have_css('.skill-tag', text: skill)
end

Then("I should see {string} as my role") do |role|
  expect(page).to have_field(with: role)
end
