/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import 'cypress-file-upload';


Cypress.Commands.add("login", (email, password) => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");
  });
  
  Cypress.Commands.add("logout", () => {
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });
  