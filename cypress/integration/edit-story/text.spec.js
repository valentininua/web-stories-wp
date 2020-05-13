context('Text element', () => {
  beforeEach(() => {
    cy.viewport(1680, 948);
    cy.visit('/wp-admin/post-new.php?post_type=web-story');
    cy.get('body').wait(100)
    cy.get('#user_login').type('admin')
    cy.get('#user_pass').type('password{enter}')
    // .first().focus()
    // cy.findByLabelText(/Username/i, { selector: 'input' }).type('admin', { delay: 20 });
    // cy.findByLabelText(/Password/i, { selector: 'input' }).type('password{enter}', { delay: 20 });
  });

  it('Can insert and edit Text element', () => {
    // cy.contains(/log in/i).click()
    // cy.contains('log in', { matchCase: false }).click()
    // cy.contains('log in', { matchCase: false }).click()
    // cy.contains('Add new text element').click()
    cy.get('[data-testid="FramesLayer"]').should('exist').wait(100);
    cy.findByLabelText('Add new text element').click();
    // cy.findByText('Fill in some text').click()
    // cy.get('[data-testid="FramesLayer"]').findAllByText('Fill in some text').click().type('simea')
    const editor = cy.get('[data-testid="FramesLayer"]')
      .findByText('Fill in some text')
      .click()
      .get('[contenteditable]')

    editor.type('{selectall}First line{enter}Second line{esc}');
    // editor.type('{selectall}First line');
    // editor.type('{selectall}HELLO WORLD{esc}');
    // editor.type(`{meta}a`)
    // editor.type(`{control}a`)
    // editor.type(`{command}a`)

    // cy.get("body").type("{meta}a")
    // editor.type("{command}a")
    //{meta}a

    cy.get('[data-testid="text.color"] button').click();
    // cy.pause().log('test')
    // cy.findByLabelText('Color and gradient picker').then($el => console.log($el))
    // cy.findByLabelText('Color and gradient picker').debug()
    cy.findByLabelText('Color and gradient picker').then(($el) => {
      const el = $el.get(0);
      const bb = el.getBoundingClientRect();
      console.log($el, el);
      cy.wrap($el).click(
        (bb.right - bb.left) * 0.7,
        (bb.bottom - bb.top) * 0.3
        // ).wait(1000).type('{esc}', { force: true });
      )
      cy.get('body').type('{esc}').wait(1000)
    })

    cy.get('[data-testid="FramesLayer"]')
      .findByText("First line")
    // .click()
    // .move({ x: 100, y: 100 })
  });
});
