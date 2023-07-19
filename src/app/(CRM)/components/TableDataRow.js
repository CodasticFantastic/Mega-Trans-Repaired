import Image from "next/image";
import Link from "next/link";
import EditIcon from "@/images/icons/editIcon.png";
import CircleArrowDownIcon from "@/images/icons/circleArrowDownIcon.png";
import PhoneIcon from "@/images/icons/phoneIcon.png";
import EmailIcon from "@/images/icons/emailIcon.png";
import CompanyIcon from "@/images/icons/companyIcon.png";

export default function TableDataRow({ order }) {
  let day;
  let month;
  let year;
  let hour;
  let minutes;

  function formatDate(input) {
    const date = new Date(input);
    day = date.getDate();
    month = date.toLocaleDateString("pl-PL", { month: "long" });
    year = date.getFullYear();
    hour = date.getHours();
    minutes = date.getMinutes();
  }

  return (
    <div className="tr">
      <div className="mainInfo">
        <div className="col1 td">
          <input type="checkbox" />
        </div>
        <div className="col2 td">{order.orderId}</div>
        <div className="col3 td">{order.status}</div>
        <div className="col4 td">
          {formatDate(order.updatedAt)}
          {` ${day} ${month} ${year} o ${hour}:${minutes}`}
        </div>
        <div className="col5 td">{order.recipientName}</div>
        <div className="col6 td">
          {order.orderPostCode} {order.orderCity} <br /> {order.orderStreet} {order.orderStreetNumber}{" "}
          {order.orderFlatNumber && `/ ${order.orderFlatNumber}`}
        </div>
        <div className="col7 td">
          <Link href={`/updateOrder/${order.orderId}`}>
            <Image src={EditIcon} alt={`Edytuj zamwienie nr: ${order.orderId}`} />
          </Link>
          <label className="showMoreLabel">
            <input type="checkbox" className="showMoreInput" />
            <Image src={CircleArrowDownIcon} alt={`Rozwiń zamwienie nr: ${order.orderId}`} />
          </label>
        </div>
      </div>
      <div className="detailInfo">
        <div className="tr">
          <div className="addInfoHeader">
            <p>Dodatkowe Informacje</p>
          </div>
          <div className="addInfoContent">
            <div className="additionalInfo">
              <Image src={PhoneIcon} alt={`Numer telefonu`} />
              <p>{order.recipientPhone}</p>
            </div>
            <div className="additionalInfo">
              <Image src={EmailIcon} alt={`Adres Email: `} />
              <p>{order.recipientEmail}</p>
            </div>
            <div className="additionalInfo">
              <Image src={CompanyIcon} alt={`Dostawa od firmy: `} />
              <p>{order.user.company}</p>
            </div>
          </div>
        </div>
        <div className="tr">
          <div className="addInfoHeader">
            <p className="title">Ilość Paczek</p>
            <p className="counter">{order.packages.length}</p>
          </div>
          <div className="addInfoContent col">
            {order.packages.map((packageItem) => {
              return (
                <div className="row" key={packageItem.packageId}>
                  <p className="rowData1 rowData">{packageItem.packageId}</p>
                  <p className="rowData2 rowData">{packageItem.commodityName}</p>
                  <p className="rowData3 rowData">
                    {packageItem.commodityPaymentType === "Pobranie" ? packageItem.commodityPrice : "Opłacona"}
                  </p>
                  <p className="rowData4 rowData">{packageItem.commodityNote}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="tr">
          <div className="addInfoHeader">
            <p>Notatka</p>
          </div>
          <div className="addInfoContent note">
            <p>{order.orderNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
