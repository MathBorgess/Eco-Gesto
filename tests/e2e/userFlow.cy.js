describe('Eco-Gesto Music.AI Integration - User Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application successfully', () => {
    cy.get('h1').should('contain', 'Eco-Gesto');
    cy.get('#startBtn').should('be.visible');
  });

  it('should initialize system and request webcam permission', () => {
    // Mock webcam permission
    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
        getTracks: () => [{ stop: () => {} }]
      });
    });

    cy.get('#startBtn').click();
    cy.get('#status').should('contain', 'Sistema iniciado');
  });

  it('should generate audio from gesture', () => {
    // Setup
    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
        getTracks: () => [{ stop: () => {} }]
      });
    });

    cy.get('#startBtn').click();
    cy.wait(2000);

    // Simulate gesture detection
    cy.window().then((win) => {
      win.simulateGesture({
        type: 'explosive',
        features: {
          position: { x: 0.5, y: 0.5 },
          velocity: 0.08,
          energy: 0.9
        }
      });
    });

    // Verify creature was created
    cy.get('.creature-list').should('contain', 'Ignis');
    
    // Verify audio is processing
    cy.get('.processing-indicator', { timeout: 2000 }).should('be.visible');
  });

  it('should display mix history', () => {
    cy.get('#startBtn').click();
    cy.wait(1000);

    // Generate a few mixes
    for (let i = 0; i < 3; i++) {
      cy.window().then((win) => {
        win.simulateGesture({
          type: 'expansive',
          features: { energy: 0.5 + i * 0.1 }
        });
      });
      cy.wait(2000);
    }

    // Open history
    cy.get('#historyBtn').click();
    cy.get('.history-modal').should('be.visible');
    cy.get('.history-item').should('have.length.at.least', 3);
  });

  it('should adjust gene influence slider', () => {
    cy.get('#geneInfluenceSlider').invoke('val', 0.8).trigger('input');
    cy.get('#influenceValue').should('contain', '0.8');
  });

  it('should handle API error gracefully', () => {
    // Intercept API call and force error
    cy.intercept('POST', 'https://api.music.ai/v1/workflows/run', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('apiError');

    cy.get('#startBtn').click();
    cy.wait(1000);

    cy.window().then((win) => {
      win.simulateGesture({ type: 'subtle', features: { energy: 0.3 } });
    });

    cy.wait('@apiError');
    
    // Verify fallback notification
    cy.get('.notification')
      .should('contain', 'Usando mixagem local')
      .and('have.class', 'warning');
  });

  it('should play audio preview from history', () => {
    cy.get('#startBtn').click();
    cy.wait(1000);

    // Generate mix
    cy.window().then((win) => {
      win.simulateGesture({ type: 'upward', features: { energy: 0.6 } });
    });
    cy.wait(3000);

    // Open history and play
    cy.get('#historyBtn').click();
    cy.get('.history-item').first().find('.play-btn').click();
    
    cy.get('audio').should('exist').and('have.prop', 'paused', false);
  });

  it('should download mix from history', () => {
    cy.get('#startBtn').click();
    cy.wait(1000);

    cy.window().then((win) => {
      win.simulateGesture({ type: 'downward', features: { energy: 0.4 } });
    });
    cy.wait(3000);

    cy.get('#historyBtn').click();
    cy.get('.history-item').first().find('.download-btn').click();
    
    // Verify download was triggered
    cy.window().then((win) => {
      expect(win.downloadTriggered).to.be.true;
    });
  });

  it('should clear history', () => {
    cy.get('#startBtn').click();
    cy.wait(1000);

    // Generate multiple mixes
    for (let i = 0; i < 3; i++) {
      cy.window().then((win) => {
        win.simulateGesture({ type: 'neutral', features: {} });
      });
      cy.wait(2000);
    }

    cy.get('#historyBtn').click();
    cy.get('#clearHistoryBtn').click();
    
    cy.get('.confirmation-dialog').should('be.visible');
    cy.get('.confirm-btn').click();
    
    cy.get('.history-item').should('have.length', 0);
  });

  it('should display API quota usage', () => {
    cy.get('#metricsBtn').click();
    cy.get('.metrics-dashboard').should('be.visible');
    cy.get('.quota-meter').should('exist');
    cy.get('.quota-text').should('match', /\d+ \/ \d+ requests/);
  });

  it('should show loading state during mix processing', () => {
    cy.intercept('POST', 'https://api.music.ai/v1/workflows/run', (req) => {
      req.reply((res) => {
        res.delay = 5000; // 5 second delay
        res.send({ job_id: 'test_123', status: 'pending' });
      });
    });

    cy.get('#startBtn').click();
    cy.wait(1000);

    cy.window().then((win) => {
      win.simulateGesture({ type: 'explosive', features: { energy: 0.9 } });
    });

    cy.get('.processing-indicator').should('be.visible');
    cy.get('.progress-bar').should('exist');
    cy.get('.loading-text').should('contain', 'Processando');
  });

  it('should handle rapid gestures with debouncing', () => {
    cy.get('#startBtn').click();
    cy.wait(1000);

    // Rapid gestures
    for (let i = 0; i < 5; i++) {
      cy.window().then((win) => {
        win.simulateGesture({ type: 'expansive', features: {} });
      });
      cy.wait(100); // Very fast
    }

    // Should process only some (debounced)
    cy.wait(3000);
    cy.get('.creature-list .creature').should('have.length.lessThan', 5);
  });

  it('should persist settings in localStorage', () => {
    cy.get('#geneInfluenceSlider').invoke('val', 0.6).trigger('input');
    cy.get('#enableMusicAI').uncheck();

    // Reload page
    cy.reload();

    // Verify settings persisted
    cy.get('#geneInfluenceSlider').should('have.value', '0.6');
    cy.get('#enableMusicAI').should('not.be.checked');
  });

  it('should show responsive design on mobile', () => {
    cy.viewport('iphone-x');
    cy.get('.mobile-menu').should('be.visible');
    cy.get('.desktop-sidebar').should('not.be.visible');
  });

  it('should be accessible (a11y)', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
