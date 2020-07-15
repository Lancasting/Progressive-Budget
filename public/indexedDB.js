const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
const request = indexedDB.open("Budget", 1);

let db;

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("waiting", { autoIncrement: true });
}

request.onerror = function (e) {
    console.log("There was an error");
};

request.onsuccess = ({ target }) => {
   db = target.result;
    if (navigator.online) {
        postToDatabase();
    } 
}

function saveRecord(item)  {
    let transaction = db.transaction(["waiting"], "readwrite");
    let store = transaction.objectStore(["waiting"]);
    store.add(item);
}

function postToDatabase() {
    let transaction = db.transaction(["waiting"], "readwrite");
    let store = transaction.objectStore(["waiting"]);
    let getAll = store.getAll();
    getAll.onsuccess = () => {
        if(getAll.result.length > 0) {// add if getall result .length > 0 then run fetch
        fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                return response.json();
                
            }).then(() => {
                let transaction = db.transaction(["waiting"], "readwrite");
                let store = transaction.objectStore(["waiting"]);
                store.clear();
            });
        }
    }
}
window.addEventListener("online", postToDatabase);