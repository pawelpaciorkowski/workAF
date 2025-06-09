/// <reference types="cypress" />


describe('Test dodawania zleceniodawcy', () => {
  it('Powinien dodać zleceniodawcę i przejść dalej', () => {
    cy.viewport(1920, 1080);
    cy.visit("http://10.1.252.81:8888/login");

    // **Logowanie**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("pawel.paciorkowski@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Przekierowanie na główną stronę**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Rozpoczęcie nowego wniosku**
    cy.contains("Nowy Wniosek", { timeout: 10000 })
      .should("be.visible")
      .click();
    cy.contains("button", "Rozpocznij wniosek", { timeout: 10000 }).click();

    // **Wybór rodzaju podmiotu**
    cy.get("#react-select-2-input").click().type("{enter}"); // Wybór pierwszej opcji

    // **Wybór segmentu biznesowego**
    cy.get("#react-select-3-input").click().type("{enter}");

    // **Kliknięcie w "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wpisanie numeru RPWDl**
    cy.get('input[name="searchInput-rpwdlNIP"]')
      .should("be.visible")
      .type("5220000217");

    // **Kliknięcie "Szukaj w bazie RPWDL"**
    cy.get("#searchInput-rpwdlNIP").should("be.visible").click();
    cy.wait(2000);

    // **Wybór pierwszej opcji województwa**
    cy.get("#react-select-4-input").click().type("{enter}");

    // **Wpisanie losowego numeru OOID (min. 4 cyfry)**
    const randomOID = Math.floor(1000 + Math.random() * 9000).toString();
    cy.get("#number-medicalRepresentativeOIDId")
      .should("be.visible")
      .type(randomOID);

    // **Wpisanie kodu pocztowego**
    cy.get("#input-medicalRepresentativePostalCode")
      .should("be.visible")
      .type("00-888");

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do etapu "Wybór zleceniodawców"**
    cy.contains("Wybór zleceniodawców", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie w "Dodaj zleceniodawcę"**
    cy.contains("button", "Dodaj zleceniodawcę").should("be.visible").click();

    // **Modal - wybór komórki (druga opcja)**
    cy.get("#react-select-5-input").click();
    cy.wait(1000);

    // Czekamy na załadowanie opcji, a następnie wybieramy drugą opcję
    cy.get("[id^=react-select-5-option]")
      .should("have.length.greaterThan", 1)
      .eq(1) // Wybieramy drugą opcję
      .click();

    // **Wybór stawki VAT (druga opcja)**
    cy.get("#react-select-6-input").click();
    cy.wait(1000);
    cy.get("[id^=react-select-6-option]")
      .should("have.length.greaterThan", 1)
      .eq(1) // Wybieramy drugą opcję
      .click();

    // **Zaznaczenie toggle "Przypisz zleceniodawcę do jednostki"**
    cy.get("#toggle-isPrincipalAssignedToUnit").click({ force: true });

    // **Obsługa modala ostrzeżenia - kliknięcie "Tak, kontynuuj"**
    cy.contains("h2", "UWAGA!!!", { timeout: 5000 }).should("be.visible");

    // **Opcja 1: Użycie precyzyjnego selektora i oczekiwanie na gotowość**
    cy.get("button")
      .contains("Tak, kontynuuj", { matchCase: false })
      .should("be.visible")
      .click({ force: true });

    // **Kliknięcie "Zapisz zleceniodawcę"**
    cy.contains("button", "Zapisz zleceniodawcę").should("be.visible").click();

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w kroku "Adres korespondencyjny"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do następnego kroku**
    cy.contains("Grupa płatników", { timeout: 10000 }).should("be.visible");

    // **Wybór grupy płatników**
    cy.get("#react-select-7-input").click().type("{enter}"); // Wybór pierwszej opcji

    // **Kliknięcie "Dalej" w kroku "Adres korespondencyjny"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do następnego kroku**
    cy.contains("Grupa płatników", { timeout: 10000 }).should("be.visible");

    // **Wybór pierwszej opcji dla laboratoriów**
    cy.get("#react-select-8-input").click(); // Kliknięcie w pole wyboru
    cy.wait(1000); // Mała pauza na załadowanie opcji
    cy.get("[id^=react-select-8-option]")
      .first() // Wybór pierwszej opcji
      .click();

    // **Wybór pierwszej opcji dla zleceniodawców**
    cy.get("#react-select-9-input").click(); // Kliknięcie w pole wyboru
    cy.wait(1000); // Mała pauza na załadowanie opcji
    cy.get("[id^=react-select-9-option]")
      .first() // Wybór pierwszej opcji
      .click();

    // **Kliknięcie "Dodaj przypisanie"**
    cy.contains("button", "Dodaj przypisanie").should("be.visible").click();

    // **Kliknięcie "Dalej" w kroku "Laboratoria i zleceniodawcy"**
    cy.contains("button", "Dalej").should("be.visible").click();

    const wybierzPierwszaOpcje = (inputSelector, optionSelector) => {
      cy.get(inputSelector).click(); // Kliknięcie w pole wyboru
      cy.get(optionSelector, { timeout: 5000 })
        .should("be.visible")
        .first()
        .click(); // Czekamy na opcje i wybieramy pierwszą
    };

    // **Przykłady dla kilku selectów**
    wybierzPierwszaOpcje(
      "#react-select-10-input",
      "[id^=react-select-10-option]"
    );
    wybierzPierwszaOpcje(
      "#react-select-11-input",
      "[id^=react-select-11-option]"
    );
    wybierzPierwszaOpcje(
      "#react-select-12-input",
      "[id^=react-select-12-option]"
    );
    // **Klikamy na multi-select**
    cy.get("#react-select-13-input").click();

    // **Czekamy na pojawienie się opcji i wybieramy pierwszą**
    cy.get("[id^=react-select-13-option]", { timeout: 5000 })
      .should("be.visible")
      .first()
      .click();

    // **Klikamy poza polem, żeby zamknąć select**
    cy.get("body").click(); // lub cy.get("h1").click(); jeśli `body` nie działa

    // **Klikamy "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wypełnienie pól tekstowych dummy danymi**
    cy.get("#input-bookkeepingName").type("Jan Kowalski");
    cy.get("#input-bookkeepingPhone").type("123456789");
    cy.get("#input-bookkeepingEmail").type("jan.kowalski@example.com");

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w korku zakres badan zlecancyh przez klienta"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w korku Czy klient będzie korzystał z naszych PP"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w korku Czy będziemy odbierać próbki od klienta"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w korku Czy integracja hl7"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w input, aby otworzyć listę wyboru**
    cy.get("#react-select-14-input").click();

    // **Poczekaj na pojawienie się listy i wybierz pierwszą opcję**
    cy.get("#react-select-14-listbox").find("[role='option']").first().click();

    // **Kliknięcie "Dalej", aby przejść do kolejnego kroku**
    cy.contains("button", "Dalej").should("be.visible").click();

    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });

    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .then(($input) => {
        expect($input[0].files.length).to.be.greaterThan(0);
      });

    cy.wait(1000); // Poczekaj na reakcję aplikacji

    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    //wgraj slownik/cennik krok 12_1
    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });

    cy.wait(1000); // Poczekaj na reakcję

    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .trigger("input", { force: true })
      .trigger("blur", { force: true });

    cy.wait(1000);

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    // **Sprawdzenie, czy przeszło do kolejnego kroku**
    cy.contains("Adres korespondencyjny", { timeout: 10000 }).should(
      "be.visible"
    );

    // **Kliknięcie "Dalej" w kroku "Czy integracja HL7"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");

    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("rozliczenia@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();

    cy.contains("h5", "Pobieranie plików").should("be.visible");
    cy.contains("button", "Generuj plik").should("be.visible").click();

    cy.contains("button", "Zamknij", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w input, aby rozwinąć listę wyboru**
    cy.get("input[data-twe-select-input-ref]").click();

    // **Czekamy na rozwinięcie listy i wybór opcji "Tak"**
    cy.get("span")
      .contains("Tak") // Szukamy tekstu "Tak" w elemencie span
      .click({ force: true });

    // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Wypełnienie pola Numer K**
    cy.get('input[name="k"]')
      .type("12345") // Przykładowy numer K
      .should("have.value", "12345"); // Sprawdzenie, czy wartość została poprawnie ustawiona

    // **Wypełnienie pola Numer konta księgowego**
    cy.get('input[name="accountingAccountNumber"]')
      .type("9876543210") // Przykładowy numer konta księgowego
      .should("have.value", "9876543210"); // Sprawdzenie, czy wartość została poprawnie ustawiona

    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });

    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .then(($input) => {
        expect($input[0].files.length).to.be.greaterThan(0);
      });

    cy.wait(1000); // Poczekaj na reakcję aplikacji

    cy.contains("button", "Dalej")
      .should("not.be.disabled")
      .click({ force: true });

    // Wypełnienie pola 'Symbol' przykładową wartością
    cy.get('input[name="symbol"]')
      .type("SYMBOL123") // Dummy data - Symbol
      .should("have.value", "SYMBOL123"); // Sprawdzanie, czy wartość została poprawnie ustawiona

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");

    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("medyczny@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();

    cy.contains(
      "📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać pliki."
    ).click({ force: true });

    cy.get('input[type="file"]')
      .attachFile("w.xlsx")
      .trigger("change", { force: true })
      .then(($input) => {
        expect($input[0].files.length).to.be.greaterThan(0);
      });

    cy.wait(1000); // Poczekaj na reakcję aplikacji

    cy.contains("button", "Dalej").should("be.visible").click();

    // **Sprawdzenie, czy modal jest widoczny**
    cy.get(".bg-white.shadow-lg.rounded-lg").should("be.visible");

    // **Kliknięcie przycisku "OK" w modalu**
    cy.contains("button", "OK").click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");

    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("hl7@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();

    // Kliknięcie przycisku "Dalej" po wygenerowaniu pliku
    cy.contains("button", "Dalej").should("be.visible").click();

    // Poczekaj na załadowanie sekcji
    cy.contains("h5", "Pobranie słownika", { timeout: 10000 }).should(
      "be.visible"
    );

    // Poczekaj na pojawienie się przycisku i wymuś kliknięcie
    cy.contains("button", "Generuj plik", { timeout: 10000 })
      .should("be.visible")
      .should("not.be.disabled") // Sprawdzenie, czy nie jest zablokowany
      .click({ force: true }); // Wymuszenie kliknięcia, jeśli jest zasłonięty

    // Poczekaj na zamknięcie modala i kliknięcie przycisku "Zamknij"
    cy.contains("button", "Zamknij", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    // Kliknięcie przycisku "Dalej" po wygenerowaniu pliku
    cy.contains("button", "Dalej").should("be.visible").click();

    // Kliknięcie w pole wyboru
    cy.get("#react-select-2-input").click({ force: true });

    // Poczekanie na załadowanie opcji i wybranie ostatniej
    cy.get("[id^=react-select-2-option]", { timeout: 5000 })
      .should("be.visible")
      .last() // Pobiera ostatnią opcję z listy
      .click();

    // Kliknięcie przycisku "Dalej" po wygenerowaniu pliku
    cy.contains("button", "Dalej").should("be.visible").click();

    // tutaj trzeba dodac obluge modala z informacja i buttonem ok, aby przelogowac sie na kolejny departament
    // Sprawdź, czy modal jest widoczny
    cy.get('.bg-white.shadow-lg.rounded-lg').should('be.visible');

    // Kliknij przycisk OK
    cy.get('button.bg-blue-500').click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");

    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("logistyka@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(`button[data-action="continue"][data-flow-id="${requestId.trim()}"]`)
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should("be.visible");

    cy.contains("button", "Kontynuuj wypełnianie wniosku").should("be.visible").click();

    // Kliknięcie przycisku "Dalej" po wygenerowaniu pliku
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w input, aby rozwinąć listę wyboru**
    cy.get("input[data-twe-select-input-ref]").click();

    // **Czekamy na rozwinięcie listy i wybór opcji "Tak"**
    cy.get("span")
      .contains("Tak") // Szukamy tekstu "Tak" w elemencie span
      .click({ force: true });

    // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // Sprawdź, czy modal jest widoczny
    cy.get('.bg-white.shadow-lg.rounded-lg').should('be.visible');

    // Kliknij przycisk OK
    cy.get('button.bg-blue-500').click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");


    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("it@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();

    // **Kliknięcie w input, aby rozwinąć listę wyboru**
    cy.get("input[data-twe-select-input-ref]").click();

    // **Czekamy na rozwinięcie listy i wybór opcji "Tak"**
    cy.get("span")
      .contains("Tak") // Szukamy tekstu "Tak" w elemencie span
      .click({ force: true });

    // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // cy.contains("h5", "Pobieranie plików").should("be.visible");
    cy.contains("button", "Generuj plik").should("be.visible").click();

    cy.contains("button", "Zamknij", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();

    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");


    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("konkursy@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();



    // **Kliknięcie w input, aby rozwinąć listę wyboru**
    cy.get("input[data-twe-select-input-ref]").click();

    // **Czekamy na rozwinięcie listy i wybór opcji "Tak"**
    cy.get("span")
      .contains("Tak") // Szukamy tekstu "Tak" w elemencie span
      .click({ force: true });

    // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // // **Kliknięcie w input, aby rozwinąć listę wyboru**
    // cy.get("input[data-twe-select-input-ref]").click();

    // // **Czekamy na rozwinięcie listy i wybór opcji "nie"**
    // cy.get("span")
    //   .contains("Nie") // Szukamy tekstu "Tak" w elemencie span
    //   .click({ force: true });

    // // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    // cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();


    // **Sprawdzenie, czy wróciliśmy do panelu logowania**
    cy.url().should("include", "/login");


    // **Logowanie nowym użytkownikiem**
    cy.get('input[placeholder="Podaj swój e-mail"]')
      .should("be.visible")
      .type("zaopatrzenie@alab.com.pl");
    cy.get('input[type="password"]').type("Diviruse007@");
    cy.get("button").contains("Zaloguj się").click();

    // **Sprawdzenie, czy użytkownik zalogował się poprawnie**
    cy.url({ timeout: 10000 }).should("include", "/home");

    // **Kliknięcie w "Wyświetl listę"**
    cy.contains("button", "Wyświetl listę").should("be.visible").click();

    // **Czekamy na załadowanie listy**
    cy.get("table").should("be.visible");

    // **Kliknięcie na nagłówek "ID wniosku" (sortowanie rosnąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy 2 sekundy przed ponownym kliknięciem**
    cy.wait(2000);

    // **Kliknięcie na nagłówek "ID wniosku" ponownie (sortowanie malejąco)**
    cy.contains("th", "ID wniosku").click();

    // **Czekamy na zakończenie sortowania (opcjonalnie dodaj timeout na stabilizację UI)**
    cy.wait(2000);

    // **Pobranie najwyższego ID ze strony**
    cy.get("table tbody tr")
      .first() // Pobiera pierwszy wiersz (najwyższy ID po sortowaniu malejącym)
      .find("td:nth-child(4)") // Pobiera kolumnę z ID wniosku
      .invoke("text")
      .then((requestId) => {
        cy.log("Najwyższe ID wniosku:", requestId.trim());

        // **Kliknięcie przycisku "kontynuuj" dla najwyższego ID**
        cy.get(
          `button[data-action="continue"][data-flow-id="${requestId.trim()}"]`
        )
          .should("be.visible")
          .click();
      });

    cy.contains("h3", "Kontynuuj wypełnianie wniosku o id").should(
      "be.visible"
    );

    cy.contains("button", "Kontynuuj wypełnianie wniosku")
      .should("be.visible")
      .click();

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();


    // **Kliknięcie w input, aby rozwinąć listę wyboru**
    cy.get("input[data-twe-select-input-ref]").click();

    // **Czekamy na rozwinięcie listy i wybór opcji "Tak"**
    cy.get("span")
      .contains("Tak") // Szukamy tekstu "Tak" w elemencie span
      .click({ force: true });

    // **Sprawdzamy, czy wartość została zmieniona na "Tak"**
    cy.get("input[data-twe-select-input-ref]").should("have.value", "Tak"); // Sprawdzamy wartość w inpucie, aby upewnić się, że została ustawiona na "Tak"

    // **Kliknięcie "Dalej"**
    cy.contains("button", "Dalej").should("be.visible").click();


    // tutaj trzeba dodac obluge modala z informacja i buttonem ok, aby przelogowac sie na kolejny departament
    // Sprawdź, czy modal jest widoczny
    cy.get('.bg-white.shadow-lg.rounded-lg').should('be.visible');

    // Kliknij przycisk OK
    cy.get('button.bg-blue-500').click();

    // **Kliknięcie w menu użytkownika**
    cy.get("button#navbarDropdownMenuLink").click();

    // **Kliknięcie "Wyloguj"**
    cy.contains("button", "Wyloguj").click();
  });
});