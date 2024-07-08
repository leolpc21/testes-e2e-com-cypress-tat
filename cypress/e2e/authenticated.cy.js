
describe('Scenarios where authentication is a pre-condition', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/notes').as('getNotes')
    cy.sessionLogin()
  })

  it('successfully submits the settings form', () => {
    cy.intercept('POST', '**/prod/billing').as('paymentRequest')

    cy.fillSettingsFormAndSubmit()

    cy.wait('@getNotes')
    cy.wait('@paymentRequest')
      .its('state')
      .should('be.equal', 'Complete')
  })

  it('logs out', { tags: '@desktop-and-tablet' }, () => {
    cy.visit('/')
    cy.wait(2000)

    cy.contains('.nav a', 'Logout').click()

    cy.get('#email')
      .should('be.visible')
      .should('be.empty')
  })
})
