/// <reference types="cypress" />

describe('Test dodawania zleceniodawcy - podział na etapy', () => {

  // Etap 1: Użytkownik pawel.paciorkowski@alab.com.pl - tworzenie wniosku i dodawanie zleceniodawcy
  it('Etap 1: Tworzenie wniosku (użytkownik: pawel.paciorkowski.pm@alab.com.pl)', () => {
    cy.viewport(1920, 1080);
    cy.visit("http://10.1.252.81:8888/login");

    // **Logowanie**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("pawel.paciorkowski.pm@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");
    // Odświeżenie strony po zalogowaniu
    cy.reload();

    // Ponowne sprawdzenie, czy nadal jesteśmy na "/home" po odświeżeniu
    cy.url().should("include", "/home");

    // Kliknięcie w "Nowy Wniosek"
    cy.contains("Nowy Wniosek", { timeout: 10000 }).should("be.visible").click();

    // Weryfikacja przekierowania na stronę "/flow/create"
    cy.url().should("include", "/flow/create");

    // Kliknięcie w "Rozpocznij wniosek"
    cy.contains("button", "Rozpocznij wniosek", { timeout: 10000 }).click();


    // **Wybór rodzaju podmiotu i segmentu biznesowego**
    cy.get("#react-select-2-input").click().type("{enter}");
    cy.get("#react-select-3-input").click().type("{enter}");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wpisanie numeru RPWDl**
    cy.get('input[name="searchInput-rpwdlNIP"]')
      .should("be.visible")
      .type("5220000217");
    cy.get("#searchInput-rpwdlNIP").should("be.visible").click();
    cy.wait(2000);

    // **Wybór województwa, OOID i kodu pocztowego**
    cy.get("#react-select-4-input").click().type("{enter}");
    const randomOID = Math.floor(1000 + Math.random() * 9000).toString();
    cy.get("#number-medicalRepresentativeOIDId").should("be.visible").type(randomOID);
    cy.get("#input-medicalRepresentativePostalCode").should("be.visible").type("00-888");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wybór zleceniodawców i dodanie nowego**
    cy.contains("Wybór zleceniodawców", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dodaj zleceniodawcę").should("be.visible").click();

    // **Modal - wybór komórki i stawki VAT (druga opcja)**
    cy.get("#react-select-5-input").click();
    cy.wait(1000);
    cy.get("[id^=react-select-5-option]")
      .should("have.length.greaterThan", 1)
      .eq(1)
      .click();
    cy.get("#react-select-6-input").click();
    cy.wait(1000);
    cy.get("[id^=react-select-6-option]")
      .should("have.length.greaterThan", 1)
      .eq(1)
      .click();

    // // **Toggle: Przypisz zleceniodawcę do jednostki**
    // cy.get("#toggle-isPrincipalAssignedToUnit").click({ force: true });
    // cy.contains("h2", "UWAGA!!!", { timeout: 5000 }).should("be.visible");
    // cy.get("button")
    //   .contains("Tak, kontynuuj", { matchCase: false })
    //   .should("be.visible")
    //   .click({ force: true });

    // **Zapis i przejście do kolejnych kroków**
    cy.contains("button", "Zapisz zleceniodawcę").should("be.visible").click();
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("Grupa płatników", { timeout: 10000 }).should("be.visible");
    cy.get("#react-select-7-input").click().type("{enter}");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Laboratoria i zleceniodawcy**
    cy.contains("Grupa płatników", { timeout: 10000 }).should("be.visible");
    cy.get("#react-select-8-input").click();
    cy.wait(1000);
    cy.get("[id^=react-select-8-option]").first().click();
    cy.get("#react-select-9-input").click();
    cy.wait(1000);
    cy.get("[id^=react-select-9-option]").first().click();
    cy.contains("button", "Dodaj przypisanie").should("be.visible").click();
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wybrane selecty (przykładowa funkcja pomocnicza)**
    const wybierzPierwszaOpcje = (inputSelector, optionSelector) => {
      cy.get(inputSelector).click();
      cy.get(optionSelector, { timeout: 5000 }).should("be.visible").first().click();
    };
    wybierzPierwszaOpcje("#react-select-10-input", "[id^=react-select-10-option]");
    wybierzPierwszaOpcje("#react-select-11-input", "[id^=react-select-11-option]");
    wybierzPierwszaOpcje("#react-select-12-input", "[id^=react-select-12-option]");
    cy.get("#react-select-13-input").click();
    cy.get("[id^=react-select-13-option]", { timeout: 5000 })
      .should("be.visible")
      .first()
      .click();
    cy.get("body").click();
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wypełnienie pól tekstowych**
    cy.get("#input-bookkeepingName").type("Jan Kowalski");
    cy.get("#input-bookkeepingPhone").type("123456789");
    cy.get("#input-bookkeepingEmail").type("jan.kowalski@example.com");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kolejne kroki z przyciskiem "Dalej"**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Etap: Czy integracja hl7**
    cy.get("#react-select-14-input").click();
    cy.get("#react-select-14-listbox").find("[role='option']").first().click();
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wgrywanie plików**
    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });
    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .then(($input) => {
        expect($input[0].files.length).to.be.greaterThan(0);
      });
    cy.wait(1000);
    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    // Wgrywanie słownika/cennika (krok 12_1)
    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });
    cy.wait(1000);
    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .trigger("input", { force: true })
      .trigger("blur", { force: true });
    cy.wait(1000);
    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    // **Powrót do etapu "Czy integracja HL7"**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 2: Użytkownik rozliczenia@alab.com.pl
  it('Etap 2: Kontynuacja wniosku (użytkownik: rozliczenia@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("rozliczenia@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Przegląd listy wniosków**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();
    cy.contains("h5", "Pobieranie plików").should("be.visible");
    cy.contains("button", "Generuj plik").should("be.visible").click();
    cy.contains("button", "Zamknij", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
    cy.contains("button", "Dalej").should("be.visible").click();

    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();

    cy.get('input[name="k"]')
      .type("12345")
      .should("have.value", "12345");
    cy.get('input[name="accountingAccountNumber"]')
      .type("9876543210")
      .should("have.value", "9876543210");

    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });
    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .then(($input) => {
        expect($input[0].files.length).to.be.greaterThan(0);
      });
    cy.wait(1000);
    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    cy.get('input[name="symbol"]')
      .type("SYMBOL123")
      .should("have.value", "SYMBOL123");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 3: Użytkownik medyczny@alab.com.pl
  it('Etap 3: Kontynuacja wniosku (użytkownik: medyczny@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("medyczny@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 4: Użytkownik hl7@alab.com.pl
  it('Etap 4: Kontynuacja wniosku (użytkownik: hl7@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("hl7@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();
    cy.contains("button", "Dalej").should("be.visible").click();

    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 5: Użytkownik logistyka@alab.com.pl
  it('Etap 5: Kontynuacja wniosku (użytkownik: logistyka@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("logistyka@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();

    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 6: Użytkownik it@alab.com.pl
  it('Etap 6: Kontynuacja wniosku (użytkownik: it@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("it@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();
    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();
    cy.contains("button", "Generuj plik").should("be.visible").click();
    cy.contains("button", "Zamknij", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 7: Użytkownik konkursy@alab.com.pl
  it('Etap 7: Kontynuacja wniosku (użytkownik: konkursy@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("konkursy@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();
    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

  // Etap 8: Użytkownik zaopatrzenie@alab.com.pl
  it('Etap 8: Kontynuacja wniosku (użytkownik: zaopatrzenie@alab.com.pl)', () => {
    cy.visit("http://10.1.252.81:8888/login");
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("zaopatrzenie@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();
    cy.url({ timeout: 10000 }).should("include", "/home");

    cy.contains("button", "Wyświetl listę").should("be.visible").click();
    cy.get("table").should("be.visible");
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.contains("th", "ID wniosku").click();
    cy.wait(2000);
    cy.get("table tbody tr")
      .first()
      .find("td:nth-child(4)")
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");
    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();
    cy.get("input[data-twe-select-input-ref]").click();
    cy.get("span")
      .contains("Tak")
      .click({ force: true });
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak");
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Obsługa modala z informacją i przyciskiem OK**
    cy.get('.bg-white.shadow-lg.rounded-lg').should('be.visible');
    cy.get('button.bg-blue-500').click();

    // **Wylogowanie**
    cy.get("button#navbarDropdownMenuLink").click();
    cy.contains("button", "Wyloguj").click();
    cy.url().should("include", "/login");
  });

});
