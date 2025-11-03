let oddCollection = document.querySelectorAll("tbody tr:nth-child(odd)");



if(oddCollection && oddCollection.length > 0){
    for(let item of oddCollection){
        item.bgColor = "purple";
    }
}


let firstRow = document.querySelector("tbody tr:first-child");
if (firstRow) {
    firstRow.bgColor = "blue";
}

let lastRow = document.querySelector("tbody tr:last-child");
if (lastRow) {
    lastRow.bgColor = "green";
}

