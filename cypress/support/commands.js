
const attachFileHandler = () => {
  cy.get('#file').selectFile('cypress/fixtures/example.json')
}

Cypress.Commands.add('fillSignupFormAndSubmit', (email, password) => {
  cy.intercept('GET', '**/notes').as('getNotes')

  cy.visit('/signup')

  cy.get('#email').type(email)
  cy.get('#password').type(password, { log: false })
  cy.get('#confirmPassword').type(password, { log: false })
  cy.contains('button', 'Signup').click()
  cy.get('#confirmationCode').should('be.visible')

  cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
    sentTo: email
  }).then(message => {
    const confirmationCode = message.html.body.match(/\d{6}/)[0]

    cy.get('#confirmationCode').type(`${confirmationCode}{enter}`)
    cy.wait('@getNotes')
  })
})

Cypress.Commands.add('guiLogin', (username = Cypress.env('USER_EMAIL'), password = Cypress.env('USER_PASSWORD')) => {
  cy.intercept('GET', '**/notes').as('getNotes')

  cy.visit('/login')

  cy.get('#email').type(username)
  cy.get('#password').type(password, { log: false })
  cy.contains('button', 'Login').click()
  cy.wait('@getNotes')
})

Cypress.Commands.add('sessionLogin', (username = Cypress.env('USER_EMAIL'), password = Cypress.env('USER_PASSWORD')) => {
  const login = () => cy.guiLogin(username, password)
  cy.session(username, login)
})

Cypress.Commands.add('createNote', (noteDescription, attachFile = false) => {
  cy.intercept('POST', '**/notes').as('postNote')

  cy.visit('/notes/new')
  cy.get('#content').type(noteDescription)

  if (attachFile) {
    attachFileHandler()
  }

  cy.contains('button', 'Create').click()
  cy.wait('@postNote').then(({ response }) => {
    cy.intercept('GET', `**/notes/${response.body.noteId}`).as('getNote')
  })
  cy.wait('@getNotes')

  cy.contains('.list-group-item', noteDescription).should('be.visible')
})

Cypress.Commands.add('editNote', (noteDescription, updatedNoteDescription, attachFile = false) => {
  cy.contains('.list-group-item', noteDescription).click()
  cy.wait('@getNote')

  cy.get('#content')
    .as('contentField')
    .clear()
  cy.get('@contentField').type(updatedNoteDescription)

  if (attachFile) {
    attachFileHandler()
  }

  cy.contains('button', 'Save').click()
  cy.wait('@getNotes')

  cy.contains('.list-group-item', noteDescription).should('not.exist')
  cy.contains('.list-group-item', updatedNoteDescription).should('be.visible')
})

Cypress.Commands.add('deleteNote', (updatedNoteDescription) => {
  cy.contains('.list-group-item', updatedNoteDescription).click()
  cy.wait('@getNote')

  cy.contains('button', 'Delete').click()
  cy.wait('@getNotes')

  cy.get('.list-group-item')
    .its('length')
    .should('be.at.least', 1)
  cy.contains('.list-group-item', updatedNoteDescription).should('not.exist')
})

Cypress.Commands.add('fillSettingsFormAndSubmit', () => {
  cy.visit('/settings')
  cy.get('#storage').type('1')
  cy.get('#name').type('Mary Doe')
  cy.iframe('.card-field iframe')
    .as('iframe')
    .find('[name="cardnumber"]')
    .type('4242424242424242')
  cy.get('@iframe')
    .find('[name="exp-date"]')
    .type('1271')
  cy.get('@iframe')
    .find('[name="cvc"]')
    .type('123')
  cy.get('@iframe')
    .find('[name="postal"]')
    .type('12345')
  cy.contains('button', 'Purchase').click()
})