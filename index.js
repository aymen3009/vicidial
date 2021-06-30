require('dotenv').config()
const mariadb = require('mariadb');
const zip = require('zip-a-folder');
const fs = require("fs");
const ora = require('ora');
const figures = require('figures');
const colors = require('colors');
const deletelist = require('./functions/deletelist');
const getActiveCampaign = require('./functions/getActiveCampaign');
const getUnactiveCampaign = require('./functions/getUnactiveCampaign');

const pool = mariadb.createPool({
  host: process.env.MysqlHost,
  user: process.env.MysqlUser,
  password: process.env.MysqlPassword,
  database: process.env.MysqlDataBase
});
(async function () {
  let connection;
  try {
    connection = await pool.getConnection()
    let active =  await getActiveCampaign();
    let unactive = await getUnactiveCampaign();
    // creating archive folder
    if (!fs.existsSync(`./List_Archive`)){
     let spinner = ora({
       text: 'creating archive folder'.fontsize(16)
     })
      spinner.start()
    fs.mkdirSync(`./List_Archive`);
      spinner.stopAndPersist({
        symbol : '✔'.green ,
        text: 'Folder created ! '.green.bold
      }); }else{
        console.log('Archive Folder exist'.green.bold);
      }
      for (const campaign of unactive) {

        let campaign_id = campaign.campaign_id
        if (!fs.existsSync(`./List_Archive/${campaign_id}`)){
           let spinner = ora({
                text : `Creating Folder for ${campaign_id}`.yellow ,
                color : 'yellow'
            })
            spinner.start()
    
          fs.mkdirSync(`./List_Archive/${campaign_id}`);
         
            spinner.stopAndPersist({
              symbol : '✔'.green ,
              text: ` ${campaign_id} Folder created successfully ! `.green.bold
            });}

      let list_ids = await connection.query(`select list_id,active from vicidial_lists where campaign_id='${campaign_id}'`) ;

      for (const list_ids_element of list_ids) {
        let list_id = list_ids_element.list_id
        if(list_ids_element.active == 'N'){
          const list_name = await connection.query(`select list_name from vicidial_lists where list_id=${list_id};`)
          let savefile = ora({
            text: "",
            color: 'blue'
        });
          savefile.text = `Downloading ${list_name[0].list_name} \n`.yellow.bold;
          savefile.start()
          
  
         
          const list = await connection.query(`select lead_id,status,user,vendor_lead_code,source_id,list_id,phone_code,phone_number,title,first_name,middle_initial,last_name,address1,address2,address3,city,state,province,postal_code,country_code,email,security_phrase,comments from vicidial_list where list_id=${list_id};`);
              if(list.length > 0){
              const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
          const header = Object.keys(list[0])
          const csv = [
            header.join('\t'), // header row first
            ...list.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join('\t'))
          ].join('\r\n')
          fs.writeFileSync(`./List_Archive/${campaign_id}/${list_id}_${list_name[0].list_name}.txt`,csv)
          savefile.stopAndPersist({
              symbol : '✔'.green ,
              text: `${list_name[0].list_name} has been downloaded successfuly `.green.bold
            });
            }else{
              fs.writeFileSync(`./List_Archive/${campaign_id}/${list_id}_${list_name[0].list_name}.txt`,"This List Is Empty")
              savefile.stopAndPersist({
                symbol : '✔'.green ,
                text: `${list_name[0].list_name} has been downloaded successfuly `.green.bold
              });
            }
         
         
          
        }

      }
      await zip.zip(`./List_Archive/${campaign_id}`,`./List_Archive/${campaign_id}.zip`)

      }

  } catch (error) {
    console.log(`${error}`.red)
  }finally{
    if(connection){
      await connection.end();
    }
  }
})();

