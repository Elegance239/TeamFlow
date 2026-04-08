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
  fill_in "email", with: "chris@example.com"
  fill_in "password", with: "password123"
  click_button "Sign in"
end

Given('I open the side menu') do
  click_button 'open drawer'
end

When('I click the {string} button') do |button_text|
  retries = 0
  begin
    id_candidate = button_text.downcase.gsub(' ', '-') + "-button"
    task_dialog_id = "task-dialog-confirm-button"
    task_creation_id = "task-creation-confirm-button"

    begin
      Timeout.timeout(5) do
        loop do
          present = page.evaluate_script(<<~JS)
            (function() {
              const text = "#{button_text}";
              const id = "#{id_candidate}";
              const buttons = Array.from(document.querySelectorAll('button'));
              return !!buttons.find(b => 
                b.id === "#{task_dialog_id}" || 
                b.id === "#{task_creation_id}" || 
                b.id === id || 
                b.innerText.trim().toUpperCase() === text.toUpperCase()
              );
            })()
          JS
          break if present
          sleep 0.2
        end
      end
    rescue Timeout::Error, Capybara::ElementNotFound
    end

    js_selector = <<~JS
      (function() {
        const text = "#{button_text.upcase}";
        const id = "#{id_candidate.upcase}";
        const taskDialogId = "#{task_dialog_id.upcase}";
        const taskCreationId = "#{task_creation_id.upcase}";

        const buttons = Array.from(document.querySelectorAll('button'));
        const found = buttons.find(b => {
          const bId = (b.id || "").toUpperCase();
          const bTestId = (b.getAttribute('data-testid') || "").toUpperCase();
          const bText = (b.innerText || "").trim().toUpperCase();
          const spanText = b.querySelector('span') ? b.querySelector('span').innerText.trim().toUpperCase() : "";
          
          return bId === taskDialogId || 
                 bId === taskCreationId || 
                 bId === id || 
                 bTestId === id || 
                 bId === text ||
                 bText === text ||
                 spanText === text;
        });

        if (found) {
          found.scrollIntoView();
          found.click();
          return true;
        }
        return false;
      })()
    JS

    success = page.execute_script(js_selector)
    
    unless success
      # Final attempt using standard Capybara if JS click fails
      find_button(button_text, wait: 2, visible: true).click
    end
    
    sleep 0.5
  rescue Selenium::WebDriver::Error::StaleElementReferenceError, Capybara::ElementNotFound
    retries += 1
    if retries < 4
      sleep 1
      retry
    else
      raise
    end
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
  fill_in "email", with: "lead@example.com"
  fill_in "password", with: "password123"
  click_button "Sign in"
  user_json = { id: @user.id, email: @user.email, role: @user.role, name: @user.name,
                team_id: @user.team_id, skills: @user.skills }.to_json
  execute_script("localStorage.setItem('teamflowCurrentUser', '#{user_json.gsub("'", "\\'")}')") rescue nil
  visit "/"
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
  visit "/"
end

When('I click the {string} link') do |link_text|
  begin
    find('.MuiListItemButton-root', text: link_text, wait: 5, match: :first).click
  rescue Capybara::ElementNotFound
    click_link link_text
  end
end

When('I fill in {string} with {string}') do |field, value|
  fill_in field, with: value
end

Then('I should see the text {string}') do |text|
    expect(page).to have_content(text)
end

Then('I should not see the text {string}') do |text|
    expect(page).not_to have_content(text)
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

Then('I should see the success message {string}') do |message|
  expect(page).to have_css('.MuiSnackbar-root', text: message)
end
