import ControlHeader from "../components/ControlHeader";
import FilterSideBar from "../components/sidebars/FilterSideBar";

export default function Dashboard() {
  return (
    <div className="CrmPage">
      <FilterSideBar />
      <div className="mainContent">
        <ControlHeader />
        <main>
          <table>
            <thead>
              <tr>
                <th className="col1">Eksport</th>
                <th className="col2">Numer Paczki</th>
                <th className="col3">Status</th>
                <th className="col4">Aktualizacja</th>
                <th className="col5">Nazwa Klienta</th>
                <th className="col6">Adres</th>
                <th className="col7">Opcje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col1"><input type="checkbox" /></td>
                <td className="col2">123456789</td>
                <td className="col3">123456789</td>
                <td className="col4">123456789</td>
                <td className="col5">123456789</td>
                <td className="col6">05-077 Warszawa, Graniczna 15A</td>
                <td className="col7">123456789</td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
