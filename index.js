const puppeteer = require('puppeteer');
var fs = require('fs');

let credentials;

fs.readFile('./config.json', 'utf8', (err, file) => {
    credentials = JSON.parse(file); 

    if(credentials.email !== "" && credentials.password !== "") {
        getCoursesEmails();
    }
})

function getCoursesEmails() {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('https://lms.coderslab.pl/login');

        await page.type("input[name='_username']", `${credentials.email}`)
        await page.type("input[name='_password']", `${credentials.password}`)
        await page.click('.btn-login')
        await page.waitForNavigation()

        await page.goto('https://lms.coderslab.pl/admin/user');
    
        const data = await page.evaluate(() => {
            let coursesMails = {};
            const couses = Array.from(document.querySelectorAll('.wrapper-content .row'))    

            couses.forEach(course => {
                const tds = Array.from(course.querySelectorAll('.contact-box a address strong'));
                const name = course.querySelector('.ibox-content h2').innerText.split(": ")[1];

                coursesMails = {
                    ...coursesMails,
                    [name]: tds.map(td => {
                        var txt = td.innerText;
                        return txt;
                    })
                }
            })

            return coursesMails;
        });

        browser.close()
        writeToFile(data);
    })()
}


function writeToFile(emailsObj) {
    var stream = fs.createWriteStream("emails.txt");
    stream.once('open', function(fd) {
        const keys= Object.keys(emailsObj);

        keys.forEach(key => {
            stream.write(`${key}\n`);
            stream.write(`--------------------------------------`);
            stream.write(`\n`);
            stream.write(`\n`);


            emailsObj[key].forEach( email => {
                console.log(email);
                stream.write(`${email}\n`);
            })
        })

        stream.end();
    });
}

