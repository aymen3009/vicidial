const mariadb = require('mariadb');
const fs = require("fs");
const ora = require('ora');
const figures = require('figures');
const colors = require('colors');
const pool = mariadb.createPool({
     host: '45.32.148.84', 
     user:'cron', 
     password: '1234',
     database : "asterisk"
});
async function main() {
let conn;
  try {
	conn = await pool.getConnection();
	const rows = await conn.query("SELECT campaign_id,campaign_name,active from vicidial_campaigns $whereLOGallowed_campaignsSQL order by campaign_id");
    let active_campaign = [];
    let unactive_campaign = [];
    rows.map(ele =>{
        if(ele.active == 'Y' ){
            active_campaign.push(ele)
        }else if (ele.active == 'N'){
            unactive_campaign.push(ele)
        }
    });
    if (!fs.existsSync(`./List_Archive`)){
        spinner.text(`Creating List archive Folder`);
        spinner.color = 'Blue';
        spinner.start()

      fs.mkdirSync(`./List_Archive`);
      setTimeout(()=>{
        spinner.stopAndPersist({
          symbol : '✔'.green ,
          text: 'Folder created ! '.green.bold
        });
        
      },500);

  }

   for (const campaign of unactive_campaign) {

    let campaign_id = campaign.campaign_id
    if (!fs.existsSync(`./List_Archive/${campaign_id}`)){
        spinner.text(`Creating Folder for ${campaign_id}`);
        spinner.color = 'Blue';
        spinner.start()

      fs.mkdirSync(`./List_Archive/${campaign_id}`);
      setTimeout(()=>{
        spinner.stopAndPersist({
          symbol : '✔'.green ,
          text: 'Folder created with success ! '.green.bold
        });
        
      },500);

  }
    let list_ids = await conn.query(`select list_id,active from vicidial_lists where campaign_id='${campaign_id}'`) ;
    spinner.text(`Start downloading ${campaign_id}'s lists`);
    spinner.color = 'Blue';
    spinner.start()
    for (const list_ids_element of list_ids) {
      
    let list_id = list_ids_element.list_id
    if(list_ids_element.active == 'N'){
      const list_name = await conn.query(`select list_name from vicidial_lists where list_id=${list_id};`) 
      spinner2.text(`Downloading ${list_name} `);
      spinner2.color = 'Blue';
      spinner2.start()
    const list = await conn.query(`select lead_id,status,user,vendor_lead_code,source_id,list_id,phone_code,phone_number,title,first_name,middle_initial,last_name,address1,address2,address3,city,state,province,postal_code,country_code,email,security_phrase,comments from vicidial_list where list_id=${list_id};`);
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(list[0])
    const csv = [
      header.join('\t'), // header row first
      ...list.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('\t'))
    ].join('\r\n')
     fs.writeFileSync(`./List_Archive/${campaign_id}/${list_id}_${list_name[0].list_name}.txt`,csv)
     setTimeout(()=>{
      spinner2.stopAndPersist({
        symbol : '✔'.green ,
        text: `${list_name} has been downloaded successfuly `.green.bold
      });
      
    },500);
    }
    
    }
    
     
   }


  } catch (err) {
	throw err;
  } finally {
	if (conn) return conn.end();
  }
}
main()