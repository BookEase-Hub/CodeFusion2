const Mixpanel = require('mixpanel');

class AnalyticsService {
  constructor() {
    this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
  }

  trackSignUp(user) {
    this.mixpanel.track('Sign Up', {
      distinct_id: user.id,
      email: user.email,
      name: user.name,
      signup_method: user.provider || 'email',
      timestamp: new Date(),
    });

    this.mixpanel.people.set(user.id, {
      $email: user.email,
      $name: user.name,
      $created: new Date(),
    });
  }

  trackLogin(user) {
    this.mixpanel.track('Login', {
      distinct_id: user.id,
      email: user.email,
      login_method: user.provider || 'email',
      timestamp: new Date(),
    });
  }

  trackPageView(userId, page, properties = {}) {
    this.mixpanel.track('Page View', {
      distinct_id: userId,
      page,
      ...properties,
      timestamp: new Date(),
    });
  }

  trackFeatureUsage(userId, feature, properties = {}) {
    this.mixpanel.track('Feature Usage', {
      distinct_id: userId,
      feature,
      ...properties,
      timestamp: new Date(),
    });
  }

  trackError(userId, error, properties = {}) {
    this.mixpanel.track('Error', {
      distinct_id: userId,
      error_message: error.message,
      error_stack: error.stack,
      ...properties,
      timestamp: new Date(),
    });
  }

  updateUserProfile(user, properties = {}) {
    this.mixpanel.people.set(user.id, {
      ...properties,
      $last_seen: new Date(),
    });
  }

  trackRepositoryAction(userId, action, repository) {
    this.mixpanel.track('Repository Action', {
      distinct_id: userId,
      action,
      repository_name: repository.name,
      repository_type: repository.type,
      timestamp: new Date(),
    });
  }

  trackCodeAnalysis(userId, properties = {}) {
    this.mixpanel.track('Code Analysis', {
      distinct_id: userId,
      ...properties,
      timestamp: new Date(),
    });
  }

  trackAIFeatureUsage(userId, feature, properties = {}) {
    this.mixpanel.track('AI Feature Usage', {
      distinct_id: userId,
      feature,
      ...properties,
      timestamp: new Date(),
    });
  }
}

module.exports = new AnalyticsService(); 