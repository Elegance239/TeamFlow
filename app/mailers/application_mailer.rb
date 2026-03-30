class ApplicationMailer < ActionMailer::Base
  default from: ENV["teamflow.csci3100@gmail.com"]
  layout "mailer"
end
