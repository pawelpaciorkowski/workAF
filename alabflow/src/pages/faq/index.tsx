import React from "react";

const FAQ: React.FC<{}> = () => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Najczęściej zadawane pytania
        </h2>
        <div className="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
          <div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak zalogować się do aplikacji AlabFlow?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aby zalogować się, wejdź na stronę{" "}
                <a
                  href="http://10.1.252.81:8880/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline text-primary-600 dark:text-primary-500 hover:no-underline"
                >
                  http://10.1.252.81:8880/
                </a>
                . Wprowadź swój e-mail i hasło, a następnie kliknij "Zaloguj
                się". Jeśli zapomniałeś hasła, kliknij "Zapomniałem hasła" i
                postępuj zgodnie z instrukcjami.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak rozpocząć nowy wniosek?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Kliknij przycisk "Nowy Wniosek", który znajduje się na górze
                ekranu. Wprowadź wymagane informacje w formularzu, a następnie
                przechodź przez kolejne etapy, wypełniając wszystkie wymagane
                pola.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak dodać użytkownika w systemie?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aby dodać użytkownika, przejdź do sekcji "Użytkownicy" i kliknij
                "Dodaj użytkownika". Wypełnij formularz, podając e-mail, imię,
                nazwisko, hasło, rolę oraz inne wymagane informacje. Na koniec
                kliknij "Zapisz".
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jakie są dostępne role w systemie?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                System AlabFlow posiada następujące role użytkowników:
                <ul className="list-disc ml-5">
                  <li>Super Administrator - pełne uprawnienia</li>
                  <li>Administrator - zarządzanie zasobami</li>
                  <li>Administrator Procesu - nadzór nad procesami</li>
                  <li>
                    Przedstawiciel Handlowy - przypisany do konkretnych
                    przepływów
                  </li>
                  <li>
                    Dyrektor Regionalny - zarządzanie podwładnymi w regionie
                  </li>
                </ul>
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak działa panel główny?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Panel główny aplikacji AlabFlow to miejsce, w którym znajdziesz
                najważniejsze informacje dotyczące swoich aktywnych wniosków,
                użytkowników oraz pomocy.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Główne sekcje panelu to:
                <ul className="list-disc ml-5">
                  <li>
                    <strong>Procesy:</strong> Szybki dostęp do zarządzania i
                    przeglądania dostępnych procesów.
                  </li>
                  <li>
                    <strong>Użytkownicy:</strong> Możliwość przeglądania,
                    edytowania i zarządzania użytkownikami w systemie.
                  </li>
                  <li>
                    <strong>Pomoc:</strong> Dostęp do FAQ oraz innych materiałów
                    pomocniczych dotyczących korzystania z aplikacji.
                  </li>
                </ul>
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                W dolnej części znajdziesz sekcję{" "}
                <strong>Aktywne Wnioski</strong>, która wyświetla wnioski
                aktualnie przypisane do Twojego konta. Dla każdego wniosku
                możesz zobaczyć status, datę rozpoczęcia, NIP klienta oraz inne
                szczegóły. Aby zobaczyć pełną listę wniosków, kliknij przycisk{" "}
                <strong>"Wyświetl listę"</strong>.
              </p>
            </div>
          </div>
          <div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak działa wyszukiwanie użytkowników?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                W sekcji "Użytkownicy" możesz skorzystać z wyszukiwarki, aby
                znaleźć użytkownika na podstawie danych, takich jak imię,
                nazwisko czy e-mail. Kliknij w pole wyszukiwania i wpisz żądane
                dane.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Co zrobić w przypadku błędu walidacji formularza?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Jeśli formularz wyświetla błędy walidacji, popraw wszystkie
                podświetlone pola. Dopiero po poprawnym wypełnieniu wymaganych
                danych będzie możliwe przejście do kolejnego etapu.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak zmienić lub usunąć użytkownika?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aby zmienić dane użytkownika, kliknij ikonę edycji obok jego
                rekordu. Aby usunąć użytkownika, kliknij ikonę usuwania.
                Pamiętaj, że użytkownika można usunąć tylko wtedy, gdy nie ma on
                otwartych procesów.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Jak wrócić do panelu głównego?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Aby wrócić do panelu głównego, kliknij w logo aplikacji
                AlabFlow, które znajduje się w lewym górnym rogu ekranu.
                Zostaniesz automatycznie przekierowany do strony głównej.
              </p>
            </div>
            <div className="mb-10">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Gdzie znaleźć więcej informacji?
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                W przypadku dodatkowych pytań lub problemów, możesz zapoznać się
                z pełną instrukcją użytkownika lub skontaktować się z
                administratorem systemu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQPage: React.FC = () => {
  return (
    <div>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div>FAQ</div>
        </div>
      </nav>
      <div className="p-6 m-5 bg-white rounded shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
        <FAQ />
      </div>
    </div>
  );
};

export default FAQPage;
