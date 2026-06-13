export default function formatDate(dateString) {

    return new Date(

        dateString

    ).toLocaleDateString(

        "en-GB",

        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }

    );

}