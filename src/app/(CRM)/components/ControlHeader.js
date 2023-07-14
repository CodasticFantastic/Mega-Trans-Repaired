import Image from "next/image";
import GreenPlusIcon from "@/images/icons/greenPlusIcon.png";
import GreenExportIcon from "@/images/icons/greenExportIcon.png";
import Link from "next/link";

export default function ControlHeader() {
  return (
    <header className="ControlHeader">
      <h1>Zlecenia</h1>
      <div className="info">
        <div className="stats">
          <div className="statTile all">
            <p className="statName">
              <span>233</span> Zleceń
            </p>
          </div>
          <div className="statTile new">
            <p className="statName">
              <span>12</span> Nowych Zleceń
            </p>
          </div>
          <div className="statTile current">
            <p className="statName">
              <span>58</span> Bieżących Zleceń
            </p>
          </div>
          <div className="statTile warehouse">
            <p className="statName">
              <span>62</span> Paczek na Magazynie
            </p>
          </div>
          <div className="statTile realized">
            <p className="statName">
              <span>2243</span> Zrealizowanych Zleceń
            </p>
          </div>
        </div>
        <div className="actions">
          <div href="/dashboard/newOrder" className="eksportOrders">
            <Image src={GreenExportIcon} alt="Ikona eksportu zamwień" />
            <p>Eksportuj</p>
          </div>
          <Link href="/newOrder" className="newOrder">
            <Image src={GreenPlusIcon} alt="Ikona dodawania nowego zlecenia" />
            <p>Nowe Zlecenie</p>
          </Link>
        </div>
      </div>
    </header>
  );
}
