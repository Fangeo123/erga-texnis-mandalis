
const API_URL = "https://api.artic.edu/api/v1";
const ARTWORK_FIELDS = ['title', 'artist_title', 'date_display', 'place_of_origin'];
const IMG_PARAMETERS = "full/843,/0/default.jpg";
var BASE_IMAGE_URL = "";
var current_page = 1;

function get_artworks() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${API_URL}/artworks?limit=10&page=${current_page}&fields=${ARTWORK_FIELDS.join(",")},image_id`)
    xhr.responseType = "json";
    xhr.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            populate_table_artworks(this.response);
        }
    }
    xhr.send();
}

function fetch_image(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${BASE_IMAGE_URL}/${id}/${IMG_PARAMETERS}`)
    xhr.responseType = "blob";
    xhr.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            create_popup_image(this.response);
        }
    }
    xhr.send();
}

function populate_table_artworks(data) {
    const table_body = document.getElementById('table_body');
    table_body.innerHTML = '';
    const artworks = data['data'];
    BASE_IMAGE_URL = `${data['config']['iiif_url']}`;
    var row_count = 0;
    artworks.forEach(artwork => {
        let row = table_body.insertRow();
        let column_counter = 0;
        let id = row.insertCell(column_counter++);
        id.innerHTML = (current_page - 1)*10 + row_count;
        ARTWORK_FIELDS.forEach(column => {
            let cell = row.insertCell(column_counter++);
            cell.innerHTML = artwork[column]
        });
        row_count++;
        let button = row.insertCell(column_counter++)
        add_inspect_button(button, artwork['image_id']);
    });
}

function create_popup_image(img_data) {
    const image_modal = document.getElementById("img_modal");
    image_modal.innerHTML = "";
    image_modal.style.display = "block";
    
    let close_element = document.createElement("span");
    close_element.classList.add("close");
    close_element.innerHTML = "&times;";
    close_element.addEventListener('click', () => {
        image_modal.innerHTML = "";
        image_modal.style.display = "none";
    });
    
    let img_element = document.createElement("img");
    image_modal.appendChild(close_element);
    img_element.src = URL.createObjectURL(img_data);
    image_modal.appendChild(img_element);
}

function get_next_page() {
    current_page++;
    get_artworks();
}

function get_previous_page() {
    current_page--;
    get_artworks();
}

function add_inspect_button(element, id) {
    let button = document.createElement("button")
    button.innerText = "Περισσότερα";
    button.addEventListener('click', () => {
        fetch_image(id);
    })
    element.appendChild(button);
}

function setupListeners() {
    const prev_but = document.getElementById("previous_button");
    prev_but.addEventListener('click', () => {
        get_previous_page();
        if (current_page == 1) {
            prev_but.disabled = true;
        }
    })

    const next_but = document.getElementById("next_button");
    next_but.addEventListener('click', () => {
        if(prev_but.disabled == true) prev_but.disabled = false;
        get_next_page();
    })
}


setupListeners();
get_artworks();