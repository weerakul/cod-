/** โค้ด.gs 
 * ระบบรับสมัครนักเรียน พัฒนาโดย นายจิรศักดิ์ จิรสาโรช E-mail: niddeaw.n@gmail.com Tel : 0806393969
 * เครดิตและอ่านรายละเอียด : https://github.com/jamiewilson/form-to-google-sheets
 * เครดิตต้นฉบับ: http://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/
 * อัพเดทโค้ด 30 เมษายน 2564 เพิ่มระบบสร้างไฟล์ PDF ใบสมัคร , ส่ง อีเมล , แจ้งเตือนทางไลน์กลุ่ม , อัพโหลดรูปภาพ เครดิต ครูเก๋ 
 * ตัวอย่างทำสำเนา
 * Google Sheet : https://docs.google.com/spreadsheets/d/1Hex42FmIAU3zle9lTGJjcOtfpwgQ0uP_owVySVyUWlc/copy
 * Google Slide : https://docs.google.com/presentation/d/1Cxu1u0OxgqhDEbJcIUJovP0UE8OQ2VJC6Wul7UjaM8Y/copy
 */

var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
  	const folderId = "ID_โฟลเดอร์รูปภาพ";  // ID_โฟลเดอร์รูปภาพ

    const blob = Utilities.newBlob(JSON.parse(e.postData.contents), e.parameter.mimeType, e.parameter.filename);
    const file = DriveApp.getFolderById(folderId).createFile(blob);
    const responseObj = {filename: file.getName(), fileId: file.getId(), fileUrl: file.getUrl()};

    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName('Sheet1') // ระบุชื่อชีต

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

	sheet.getRange(sheet.getLastRow(),41).setValue(responseObj['fileId']) // เซ็ตค่า ID ของไฟล์ภาพที่ตำแหน่งแถวล่าสุด, คอลัมภ์ที่ 41 **แก้ไข
	var getim_id = sheet.getRange(sheet.getLastRow(),41).getDisplayValue() // แสดงค่า ID ของไฟล์ภาพ คอลัมภ์ที่ 41 **แก้ไข
	var Image_URL = 'https://doc.google.com/uc?export=view&id='+ getim_id; // ลิงค์ URL UC ภาพจากค่า ID ของไฟล์ภาพ

	sheet.getRange(sheet.getLastRow(),42).setValue(Image_URL) // เซ็ตค่าลิงค์ URL UC ลงคอลัมภ์ที่ 42 **แก้ไข
	
/* ---------------------------------------------------------------------------------------------------------------------*/
/** ระบบสร้างไฟล์ PDF ใบสมัคร , ส่ง อีเมล , แจ้งเตือนทางไลน์กลุ่ม
 * เครดิต ครูสมพงษ์ โพคาศรี E-mail: Spkorat0125@gmail.com Tel : 0956659190 
 * Line : guytrue fb: https://www.facebook.com/spkorat0125
 */

// สร้าง pdf กำหนดไฟล์แม่แบบและโฟลเดอร์ที่ใช้งาน --------------------------------------------------------------------------------
    var SlideFile = "ID_สไลด์ไฟล์แม่แบบ"; // ID_สไลด์ไฟล์แม่แบบ
    const tempFolder = DriveApp.getFolderById("ID_โฟลเดอร์_temp"); // ID_โฟลเดอร์ temp
    const pdfFolder = DriveApp.getFolderById("ID_โฟลเดอร์_PDF"); // ID_โฟลเดอร์ PDF
            
// ส่วนสำหรับสร้างสำเนาไฟล์ต้นฉบับ ---------------------------------------------------------------------------------------------
    var strYear = parseInt(Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy")) + 543;
    var strMonth = Utilities.formatDate(new Date(), "Asia/Bangkok", "M");
    var strDay = Utilities.formatDate(new Date(), "Asia/Bangkok", "d");
    var strhour=Utilities.formatDate(new Date(), "Asia/Bangkok", "HH");
    var strMinute=Utilities.formatDate(new Date(), "Asia/Bangkok", "mm");
    var strMonthCut = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    var strMonthThai = strMonthCut[strMonth];  
    var DatetimeFile=strDay+' '+strMonthThai+' '+strYear+ ' เวลา '+strhour+'.'+strMinute;

    var SlideTempFile_Copy = DriveApp.getFileById(SlideFile);              
    var SlideFile_Copy = SlideTempFile_Copy.makeCopy('ม.1 '+newRow[3]+newRow[4]+" "+newRow[5]+" "+DatetimeFile,tempFolder); 
    var SlideID_Copy = SlideFile_Copy.getId();
    var SlideNew_Copy = SlidesApp.openById(SlideID_Copy);
    var slides = SlideNew_Copy.getSlides();
    var TemplateSlide = slides[0]; 
    var shapes = TemplateSlide.getShapes();
	
	TemplateSlide.insertImage(Image_URL,195,10,50,40).getBorder().setWeight(1) // แทรกรูปภาพและกำหนดขนาดภาพ insertImage(imageUrl, left, top, width, height)
	
// ส่วนของการผนวกข้อมูลกับเอกสาร (แทนที่ข้อความด้วยข้อมูล) ------------------------------------------------------------------   
    shapes.forEach(function (shape) {
    shape.getText().replaceAllText('{service}',newRow[1]);
    shape.getText().replaceAllText('{reg_type}',newRow[2]);
    shape.getText().replaceAllText('{prefix}',newRow[3]);
    shape.getText().replaceAllText('{name}',newRow[4]);
    shape.getText().replaceAllText('{lastname}',newRow[5]);
    shape.getText().replaceAllText('{birthday}',newRow[6]);
    shape.getText().replaceAllText('{idcard}',newRow[7]);
    shape.getText().replaceAllText('{race}',newRow[8]);
    shape.getText().replaceAllText('{nationality}',newRow[9]);
    shape.getText().replaceAllText('{religion}',newRow[10]);
    shape.getText().replaceAllText('{house_no}',newRow[11]);
    shape.getText().replaceAllText('{village_no}',newRow[12]);
    shape.getText().replaceAllText('{village}',newRow[13]);
    shape.getText().replaceAllText('{road}',newRow[14]);
    shape.getText().replaceAllText('{alley}',newRow[15]);
    shape.getText().replaceAllText('{district}',newRow[16]);
    shape.getText().replaceAllText('{amphoe}',newRow[17]);
    shape.getText().replaceAllText('{province}',newRow[18]);
    shape.getText().replaceAllText('{zipcode}',newRow[19]);
    shape.getText().replaceAllText('{student_phone}',newRow[20]);
    shape.getText().replaceAllText('{school}',newRow[21]);
    shape.getText().replaceAllText('{district1}',newRow[22]);
    shape.getText().replaceAllText('{amphoe1}',newRow[23]);
    shape.getText().replaceAllText('{province1}',newRow[24]);
    shape.getText().replaceAllText('{zipcode1}',newRow[25]);
    shape.getText().replaceAllText('{gpa}',newRow[26]);
    shape.getText().replaceAllText('{school_type}',newRow[27]);
    shape.getText().replaceAllText('{disability}',newRow[28]);
    shape.getText().replaceAllText('{father}',newRow[29]);
    shape.getText().replaceAllText('{father_occupation}',newRow[30]);
    shape.getText().replaceAllText('{father_phone}',newRow[31]);
    shape.getText().replaceAllText('{mother}',newRow[32]);
    shape.getText().replaceAllText('{mother_occupation}',newRow[33]);
    shape.getText().replaceAllText('{mother_phone}',newRow[34]);
    shape.getText().replaceAllText('{parent}',newRow[35]);
    shape.getText().replaceAllText('{parent_occupation}',newRow[36]);
    shape.getText().replaceAllText('{parent_phone}',newRow[37]);
    shape.getText().replaceAllText('{relationship}',newRow[38]);
});

    var pdfName ="ม.1 " + newRow[3]+newRow[4]+" "+newRow[5]+" "+DatetimeFile
    SlideNew_Copy.saveAndClose();
    
// สร้างไฟล์ pdf ---------------------------------------------------------------------------------------------------------------
    const pdfContentBlob = SlideFile_Copy.getAs(MimeType.PDF); 
    var newPDFFile=pdfFolder.createFile(pdfContentBlob).setName(pdfName+".pdf"); 
    //tempFolder.removeFile(SlideFile_Copy); // ลบไฟล์สำเนาสไลด์ หากต้องการลบไฟล์ให้ลบเครื่องหมาย // ด้านหน้าออก
    
// ส่วนการส่งอีเมล์ -------------------------------------------------------------------------------------------------------------
    //var email = ""; //ส่งเมลไปที่เจ้าหน้าที่
    //MailApp.sendEmail(email, "สมัครเรียนออนไลน์", "จาก โรงเรียนวัดไร่ขิงวิทยา ท่านได้ทำการลงทะเบียนเรียนด้วยระบบออนไลน์ กรุณาตรวจสอบข้อมูล", {attachments: [newPDFFile],});
    
// ลบไฟล์สำเนาออก -----------------------------------------------------------------------------------------------------------
    // SlideTempFile_Copy.setTrashed(true); // ไฟล์ google slide สำเนาต้นฉบับ หากต้องการลบไฟล์ให้ลบเครื่องหมาย // ด้านหน้าออก
    // newPDFFile.setTrashed(true); // ไฟล์ PDF หากต้องการลบไฟล์ให้ลบเครื่องหมาย // ด้านหน้าออก
    // SlideFile_Copy.setTrashed(true); // ไฟล์ google slide สำเนาต้นฉบับที่ถูกแทนที่ด้วยข้อความใหม่ หากต้องการลบไฟล์ให้ลบเครื่องหมาย // ด้านหน้าออก

// กำหนดตัวแปรให้กับข้อความที่จะส่งไลน์แจ้งเตือน -------------------------------------------------------------------------------
	var Url_pdf = newPDFFile.getUrl()
	addlink(Url_pdf)
	var sht = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2")
	var short_url = sht.getRange("B1").getValue()
	var text_data = '📣 สมัครเรียนระดับชั้น ม.1\n';
      text_data += 'วันที่ '+DatetimeFile+" น."+'\nชื่อ-นามสกุล : '+newRow[3]+newRow[4]+" "+newRow[5]+'\n';
      text_data += 'ดาวน์โหลดใบสมัคร '+short_url;
      sendLineNotify(text_data);
/* -----------------------------------------------------------------------------------------------------------------------------*/
 
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

function  addlink(Url_pdf){
	 var ws = SpreadsheetApp.getActiveSpreadsheet()
	 var sheet1 = ws.getSheetByName("Sheet1")
	 var sheet2 = ws.getSheetByName("Sheet2")
	 var lastrow = sheet1.getLastRow()
	sheet1.getRange(lastrow,43).setValue(Url_pdf) // ลิงค์ PDF
	sheet2.getRange("A1").setValue(Url_pdf) // ลิงค์ PDF จาก Sheet2
}

// ส่วนฟังก์ชั่นแจ้งเตือนไลน์ -------------------------------------------------------------------------------------------------------
function sendLineNotify(message) {

    var token = [""]; // ใส่ access token Line
    var options = {
        "method": "post",
        "payload": "message=" + message,
        "headers": {
            "Authorization": "Bearer " + token
        }
    };

    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}


***********************************************************************************************************************
***********************************************************************************************************************
/**โค้ด index.html
<!DOCTYPE html>
<html lang="th">
<head>

<!-- อัพเดทโค้ด 30 เม.ย. 64 -->

    <title>ระบบรับสมัครนักเรียน | โรงเรียนวัดไร่ขิงวิทยา</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
	<!-- ICON Font Awesome -->
    <script src="https://kit.fontawesome.com/ad42651166.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
    <!-- Google Fonts -->
	<link href='https://fonts.googleapis.com/css?family=Itim|Kanit|Mali|Mitr|Niramit|Pattaya|Prompt|Questrial|Sarabun|Sriracha' rel='stylesheet' type='text/css'>
	<!-- JQUERY -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
	<!-- jquery.Thailand.js -->   
    <link rel="stylesheet" href="./jquery.Thailand.js/dist/jquery.Thailand.min.css">
	<!-- CSS Files 
    <link href="style.css" rel="stylesheet" /> -->
	<!-- CSS Files -->
	<style type='text/css'>
.itim {
  font-family: 'Itim', sans-serif;
}
.kanit {
  font-family: 'Kanit', sans-serif;
}
.mali {
  font-family: 'Mali', sans-serif;
}
.mitr {
  font-family: 'Mitr', sans-serif;
}
.pattaya {
  font-family: 'Pattaya', sans-serif;
}
.prompt {
  font-family: 'Prompt', sans-serif;
}
.questrial {
  font-family: 'Questrial', sans-serif;
}
.sarabun {
  font-family: 'Sarabun', sans-serif;
}
.sriracha {
  font-family: 'Sriracha', sans-serif;
}
@font-face {
  font-family: 'Sarabun';
}
body { font-family: 'Prompt' !important; }

::placeholder {
  color: peachpuff;
  font-size: 15px;
  text-align: center; 
}
.error{
  color:#F00;
}
.error.true{
  color:#6bc900;
}
#button {
  display: inline-block;
  background-color: #FF9800;
  width: 50px;
  height: 50px;
  text-align: center;
  border-radius: 4px;
  position: fixed;
  bottom: 30px;
  right: 30px;
  transition: background-color .3s, 
    opacity .5s, visibility .5s;
  opacity: 0;
  visibility: hidden;
  z-index: 1000;
}
#button::after {
  content: "\f077";
  font-family: FontAwesome;
  font-weight: normal;
  font-style: normal;
  font-size: 2em;
  line-height: 50px;
  color: #fff;
}
#button:hover {
  cursor: pointer;
  background-color: #333;
}
#button:active {
  background-color: #555;
}
#button.show {
  opacity: 1;
  visibility: visible;
}
</style>
</head>
<body>
<!-- Back to top button -->
<a id="button"></a>
<!-- Menu bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#"></a>
            <h1 class="prompt text-white"><img src="https://drive.google.com/uc?id=1AkAWDZnllmIHVsKFuJEd_tIWgSh5K0pt" style="width:80px;height:80px;">ระบบรับสมัครนักเรียน ม.1 ปีการศึกษา 2564</h1>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor03" aria-controls="navbarColor03" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          
            <div class="collapse navbar-collapse" id="navbarColor03">
              <ul class="navbar-nav mr-auto w-100 justify-content-end">
                <li class="nav-item">
                <a class="nav-link" href="./"><i class="fas fa-home mr-2"></i> กลับหน้าหลัก</a>
              </li>
              </ul>
            </div>
        </div>
    </nav>
<!-- ปิด Menu bar -->
<!-- Content -->
<section><br>
  <div class="container">
     <!-- <center><h1>[ 24 - 28 เมษายน 2564 ]</h1><br></center> -->
	  <div class="card text-black bg-warning mb-12" style="max-width: 100rem;">
		  <h2 class="card-header prompt">ประเภททั่วไป 24 - 28 เม.ย. 64, ความสามารถพิเศษ 24 - 27 เม.ย. 64</h2>
		  <div class="card-body bg-white">
			<p class="h5 card-text sarabun">ประเภททั่วไป : สอบคัดเลือก 22 พ.ค. | ประกาศผลภายใน 24 พ.ค. | รายงานตัวและมอบตัว 29 พ.ค. | ไม่มีที่เรียนยื่นความจำนง 25-27 พ.ค.</p>
			<p class="h5 card-text sarabun">ประเภทความสามารถพิเศษ : สอบคัดเลือก 19 พ.ค. | ประกาศผลภายใน 24 พ.ค. | รายงานตัวและมอบตัว 29 พ.ค. | ไม่มีที่เรียนยื่นความจำนง 25-27 พ.ค.</p>
		  </div>
	  </div>
 </div>
</section>
<br><br>
<div class="container">
<!-- เริ่มฟอร์ม ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------->
	<form class="row g-3 needs-validation" id="demo1" name="demo1" onsubmit="handleFormSubmit(this)">
		<div class="row">
			<div class="col-md-3">
			  <h5><i class="fas fa-map-marked-alt mr-3"></i> เขตพื้นที่บริการ</h5>
			  <div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="service" id="local1" value="ในเขต" checked>
				<label class="form-check-label" for="local1">ในเขต</label>
			  </div>
			  <div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="service" id="local2" value="นอกเขต">
				  <label class="form-check-label" for="local2">นอกเขต</label>
			  </div>
			</div>
			<div class="col-md-3">
			  <h4><i class="fas fa-address-card mr-3"></i> สมัครประเภท</h4>
			  <div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="reg_type" id="type1" value="ทั่วไป" checked>
				<label class="form-check-label" for="type1">ทั่วไป</label>
			  </div>
			  <div class="form-check form-check-inline">
				<input class="form-check-input" type="radio" name="reg_type" id="type2" value="ความสามารถพิเศษ">
				  <label class="form-check-label" for="type2">ความสามารถพิเศษ</label>
			  </div>
			</div>
<!-- อัพโหลดไฟล์ -->
			<div class="col-md-4">
			<h4><i class="fa fa-camera mr-3"></i> อัปโหลดรูปนักเรียน</h4>
				<input type="hidden" class="form-control" name="filename" id="filename">
				<input type="file" class="form-control" name="file" id="uploadfile" required>
			</div>
		</div><!-- ปิด row-->
			
<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ --> 
<!-- ข้อมูลนักเรียน -->
		<span style="font-size: 1.5em; color: green;"><i class="fas fa-user"></i> ข้อมูลนักเรียน</span>
		<div class="col-md-1">
		<label for="prefix" class="form-label">คำนำหน้า</label>
			<select class="form-select" name="prefix" id="prefix" required>
			  <option selected disabled value="">เลือก...</option>
			  <option>เด็กชาย</option>
			  <option>เด็กหญิง</option>
			</select>
		</div>
		<div class="col-md-2">
			<label for="name" class="form-label">ชื่อ</label>
			<input type="text" class="form-control" name="name" id="name" required>
		</div>
		<div class="col-md-2">
			<label for="lastname" class="form-label">นามสกุล</label>
			<input type="text" class="form-control" name="lastname" id="lastname" required>
		</div>
		<div class="col-md-2">
			<label for="birthday" class="form-label">เกิดวันที่ (ปี ค.ศ.)</label>
			<input type="date" class="form-control" name="birthday" id="birthday" required>
		</div>
		<div class="col-md-2">
			<label for="idcard" class="form-label">เลขบัตรประชาชน</label>
			<input type="text" class="form-control" name="idcard" id="idcard" placeholder="กรอกเลข 13 หลัก" maxlength="13" required><span class="error"></span>  
		</div>
		<div class="col-md-1">
			<label for="race" class="form-label">เชื้อชาติ</label>
			<input type="text" class="form-control" name="race" id="race" value="ไทย" required>
		</div>
		<div class="col-md-1">
			<label for="nationality" class="form-label">สัญชาติ</label>
			<input type="text" class="form-control" name="nationality" id="nationality" value="ไทย" required>
		</div>
		<div class="col-md-1">
			<label for="religion" class="form-label">ศาสนา</label>
			<input type="text" class="form-control" name="religion" id="religion" value="พุทธ" required><br>
		</div>
		<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ --> 
		<!-- ที่อยู่ -->
		<span style="font-size: 1.5em; color: Dodgerblue;"><i class="fas fa-map-marker-alt"></i> ที่อยู่ปัจจุบัน</span>
		<div class="col-md-2">
			<label for="house_no" class="form-label">บ้านเลขที่</label>
			<input type="text" class="form-control" name="house_no" id="house_no" required>
		</div>
		<div class="col-md-2">
			<label for="village_no" class="form-label">หมู่ที่</label>
			<input type="text" class="form-control" name="village_no" id="village_no" required>
		</div>
		<div class="col-md-4">
			<label for="village" class="form-label">หมู่บ้าน</label>
			<input type="text" class="form-control" name="village" id="village" required>
		</div>
		<div class="col-md-2">
			<label for="road" class="form-label">ถนน</label>
			<input type="text" class="form-control" name="road" id="road">
		</div>
		<div class="col-md-2">
			<label for="alley" class="form-label">ซอย</label>
			<input type="text" class="form-control" name="alley" id="alley">
		</div>
		<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ --> 
		<div class="col-md-2">
			<label for="district" class="form-label">แขวง/ตำบล</label>
			<input type="text" class="form-control" name="district" id="district" required>
		</div>
		<div class="col-md-2">
			<label for="amphoe" class="form-label">เขต/อำเภอ</label>
			<input type="text" class="form-control" name="amphoe" id="amphoe" required>
		</div>
		<div class="col-md-3">
			<label for="province" class="form-label">จังหวัด</label>
			<input type="text" class="form-control" name="province" id="province" required>
		</div>
		<div class="col-md-2">
			<label for="zipcode" class="form-label">รหัสไปรษณีย์</label>
			<input type="text" class="form-control" name="zipcode" id="zipcode" pattern="[0-9]{5}" required>
		</div>
		<div class="col-md-3">
			<label for="student_phone" class="form-label">โทรศัพท์มือถือนักเรียน</label>
			<input type="tel" class="form-control" name="student_phone" id="student_phone" maxlength="10" pattern="[0-9]{10}" placeholder="0xxxxxxxxx" required><br>
		</div>

		<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ --> 
		<!-- การศึกษา -->
		<span style="font-size: 1.5em; color: blue;"><i class="fas fa-graduation-cap"></i> การศึกษา</span>
		<div class="col-md-3">
			<label for="school" class="form-label">โรงเรียนเดิม</label>
			<input type="text" class="form-control" name="school" id="school" required>
		</div>
		<div class="col-md-2">
			<label for="district1" class="form-label">แขวง/ตำบล</label>
			<input type="text" class="form-control" name="district1" id="district1" required>
		</div>
		<div class="col-md-2">
			<label for="amphoe1" class="form-label">เขต/อำเภอ</label>
			<input type="text" class="form-control" name="amphoe1" id="amphoe1" required>
		</div>
		<div class="col-md-2">
			<label for="province1" class="form-label">จังหวัด</label>
			<input type="text" class="form-control" name="province1" id="province1" required>
		</div>
		<div class="col-md-2">
			<label for="zipcode1" class="form-label">รหัสไปรษณีย์</label>
			<input type="text" class="form-control" name="zipcode1" id="zipcode1" required>
		</div>
		<div class="col-md-1">
			<label for="gpa" class="form-label">เกรดเฉลี่ย</label>
			<input type="number" class="form-control" name="gpa" id="gpa" value="" min="0.00" max="4.00" step="0.01" placeholder="4.00" required>
		</div>
<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ -->
<!-- ประเภทของโรงเรียนเดิม -->
		<div class="row">
		<div class="form-group col-md-3">
		  <p><i class="fas fa-school mr-3"></i> ประเภทของโรงเรียนเดิม</p>
		  <div class="form-check form-check-inline">
			<input type="radio" class="form-check-input" id="school_type1" name="school_type" value="รัฐบาล" checked>
			<label class="form-check-label" for="school_type1">รัฐบาล</label>
		  </div>
		  <div class="form-check form-check-inline">
			<input type="radio" class="form-check-input" id="school_type2" name="school_type" value="เอกชน">
			<label class="form-check-label" for="school_type2">เอกชน</label>
		  </div>
		</div>
		<div class="col-md-3">
		  <label for="disability" class="form-label"><i class="fas fa-wheelchair mr-3"></i> ความพิการ</label>
		  <select class="form-select" name="disability" id="disability" required><br>
			<option selected disabled value="">เลือก...</option>
			<option>ไม่พิการ</option>
			<option>บกพร่องทางการเห็น</option>
			<option>บกพร่องทางการได้ยิน</option>
			<option>บกพร่องทางสติปัญญา</option>
			<option>บกพร่องทางร่างกายและสุขภาพ</option>
			<option>มีปัญหาทางการเรียนรู้</option>
			<option>บกพร่องทางการพูดและภาษา</option>
			<option>บกพร่องทางพฤติกรรมและอารมณ์</option>
			<option>บุคคลออทิสติก</option>
			<option>บุคคลพิการซ้อน</option>
		  </select>
		</div>
		</div><!-- ปิด row -->
		<!-- เริ่มแถวใหม่ แต่ละแถวให้ได้ col 12 คอลัมภ์ --> 
		<!-- บิดา -->
		<span style="font-size: 1.5em; color: DeepPink;"><i class="fas fa-users"></i> ข้อมูลผู้ปกครอง</span>
		<div class="col-md-6">
			<label for="father" class="form-label"><i class="fas fa-male mr-3"></i> ชื่อ-สกุลบิดา</label>
			<input type="text" class="form-control" name="father" id="father" required>
		</div>
		<div class="col-md-3">
			<label for="father_occupation" class="form-label"><i class="fas fa-user-tie mr-3"></i> อาชีพบิดา</label>
			<input type="text" class="form-control" name="father_occupation" id="father_occupation" required>
		</div>
		<div class="col-md-3">
			<label for="father_phone" class="form-label"><i class="fas fa-phone-alt mr-3"></i> โทรศัพท์มือถือบิดา</label>
			<input type="tel" class="form-control" name="father_phone" id="father_phone" maxlength="10" pattern="[0-9]{10}" placeholder="0xxxxxxxxx" required>
		</div>
		<!-- มารดา -->
		<div class="col-md-6">
			<label for="mother" class="form-label"><i class="fas fa-female mr-3"></i> ชื่อ-สกุลมารดา</label>
			<input type="text" class="form-control" name="mother" id="mother" required>
		</div>
		<div class="col-md-3">
			<label for="mother_occupation" class="form-label"><i class="fas fa-user-tie mr-3"></i> อาชีพมารดา</label>
			<input type="text" class="form-control" name="mother_occupation" id="mother_occupation" required>
		</div>
		<div class="col-md-3">
			<label for="mother_phone" class="form-label"><i class="fas fa-phone-alt mr-3"></i> โทรศัพท์มือถือมารดา</label>
			<input type="tel" class="form-control" name="mother_phone" id="mother_phone" maxlength="10" pattern="[0-9]{10}" placeholder="0xxxxxxxxx" required>
		</div>
		<!-- ผู้ปกครอง -->
		<div class="col-md-4">
			<label for="parent" class="form-label"><i class="fas fa-user mr-3"></i> ชื่อ-สกุลผู้ปกครอง</label>
			<input type="text" class="form-control" name="parent" id="parent" required>
		</div>
		<div class="col-md-2">
			<label for="parent_occupation" class="form-label"><i class="fas fa-user-tie mr-3"></i> อาชีพผู้ปกครอง</label>
			<input type="text" class="form-control" name="parent_occupation" id="parent_occupation" required>
		</div>
		<div class="col-md-3">
			<label for="parent_phone" class="form-label"><i class="fas fa-phone-alt mr-3"></i> โทรศัพท์มือถือผู้ปกครอง</label>
			<input type="tel" class="form-control" name="parent_phone" id="parent_phone" maxlength="10" pattern="[0-9]{10}" placeholder="0xxxxxxxxx" required>
		</div>
		<div class="col-md-3">
			<label for="relationship" class="form-label"><i class="fas fa-user-plus mr-3"></i> ความเกี่ยวข้องกับนักเรียน</label>
			<input type="text" class="form-control" name="relationship" id="relationship" required>
		</div>
		</div><!-- ปิด Row -->
<!-- บันทึกข้อมูล -->
		<br>
		<div class="col-12">
		<center><button class="btn btn-success btn-lg" type="submit" >บันทึกข้อมูล</button></center><br>
		</div>
	</form>
<!-- ปิดฟอร์ม ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------->
</div>
<hr>
<!-- Footer -->
<footer>
  <div class="bg-primary">
    <div class="container">
        <br>
      <div class="row">
        <div class="clo-lg-3 col-md-6">
          <h4 class="text-white"><i class="fa fa-graduation-cap mr-3"></i> โรงเรียนวัดไร่ขิงวิทยา</h4>
          <p class="h5 text-white">53 หมู่ 2 ต.ไร่ขิง อ.สามพราน จ.นครปฐม 73210</p>
          <p class=" h5 text-white">สำนักงานเขตพื้นที่การศึกษามัธยมศึกษานครปฐม</p>
		  <p class="text-white mali">ผู้จัดทำ <i class="fa fa-star"></i> นายจิรศักดิ์ จิรสาโรช งานรับสมัครนักเรียน © <script>
          document.write(new Date().getFullYear())
          </script> | ติดต่อ 080-6393969</p>
        </div>
      </div>
    </div>
  </div>
</footer>
<!-- ปิดแทก Footer -->
<!-- Auto Complete Thailand ที่อยู่ประเทศไทยอัตโนมัติ เครดิต /* https://earthchie.github.io/jquery.Thailand.js/ */ -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.20/js/uikit.min.js"></script>

    <!-- dependencies for zip mode -->
    <script type="text/javascript" src="./jquery.Thailand.js/dependencies/zip.js/zip.js"></script>
    <!-- / dependencies for zip mode -->

    <script type="text/javascript" src="./jquery.Thailand.js/dependencies/JQL.min.js"></script>
    <script type="text/javascript" src="./jquery.Thailand.js/dependencies/typeahead.bundle.js"></script>
    <script type="text/javascript" src="./jquery.Thailand.js/dist/jquery.Thailand.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
    
    <script type="text/javascript">
        /******************\
         *     DEMO 1     *
        \******************/ 
        // demo 1: load database from json. if your server is support gzip. we recommended to use this rather than zip.
        // for more info check README.md
/* ที่อยู่นักเรียน */
        $.Thailand({
            database: './jquery.Thailand.js/database/db.json', 

            $district: $('#demo1 [name="district"]'),
            $amphoe: $('#demo1 [name="amphoe"]'),
            $province: $('#demo1 [name="province"]'),
            $zipcode: $('#demo1 [name="zipcode"]'),

            onDataFill: function(data){
                console.info('Data Filled', data);
            },

            onLoad: function(){
                console.info('Autocomplete is ready!');
                $('#loader, .demo').toggle();
            }
        });

        // watch on change

        $('#demo1 [name="district"]').change(function(){
            console.log('ตำบล', this.value);
        });
        $('#demo1 [name="amphoe"]').change(function(){
            console.log('อำเภอ', this.value);
        });
        $('#demo1 [name="province"]').change(function(){
            console.log('จังหวัด', this.value);
        });
        $('#demo1 [name="zipcode"]').change(function(){
            console.log('รหัสไปรษณีย์', this.value);
        });
    </script>

	<script type="text/javascript">
        /******************\
         *     DEMO 1.1     *
        \******************/ 
/* ที่อยู่โรงเรียนเดิม */
        $.Thailand({
            database: './jquery.Thailand.js/database/db.json', 

            $district: $('#demo1 [name="district1"]'),
            $amphoe: $('#demo1 [name="amphoe1"]'),
            $province: $('#demo1 [name="province1"]'),
            $zipcode: $('#demo1 [name="zipcode1"]'),

            onDataFill: function(data){
                console.info('Data Filled', data);
            },

            onLoad: function(){
                console.info('Autocomplete is ready!');
                $('#loader, .demo').toggle();
            }
        });

        // watch on change

        $('#demo1 [name="district1"]').change(function(){
            console.log('ตำบล', this.value);
        });
        $('#demo1 [name="amphoe1"]').change(function(){
            console.log('อำเภอ', this.value);
        });
        $('#demo1 [name="province1"]').change(function(){
            console.log('จังหวัด', this.value);
        });
        $('#demo1 [name="zipcode1"]').change(function(){
            console.log('รหัสไปรษณีย์', this.value);
        });
    </script>
	
<!--อัพโหลดไฟล์ -->
<script>
  document.getElementById('submitBtn').addEventListener('click',
	function(e){
	  google.script.run.withSuccessHandler(onSuccess).uploadFiles(this.parentNode)
	})
	
	function onSuccess(data){
	  document.getElementById('resp').innerHTML = "File Uploaded to the path " +data;
	}
</script>

<!-- บันทึกลง Google Sheet -->
<script>
const form = document.getElementById('demo1');
form.addEventListener('submit', e => {
  setiddoc()
  e.preventDefault();
  const file = form.file.files[0];
  const fr = new FileReader();
  fr.readAsArrayBuffer(file);
  fr.onload = f => {
    
    const url = "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec";  // <--- URL เว็บแอพ
	    
    const qs = new URLSearchParams({filename: form.filename.value || file.name, mimeType: file.type,
					service: form.service.value,
					reg_type: form.reg_type.value,
					prefix: form.prefix.value,
					name: form.name.value,
					lastname: form.lastname.value,
					birthday: form.birthday.value,
					idcard: form.idcard.value,
					race: form.race.value,
					nationality: form.nationality.value,
					religion: form.religion.value,
					house_no: form.house_no.value,
					village_no: form.village_no.value,
					village: form.village.value,
					road: form.road.value,
					alley: form.alley.value,
					district: form.district.value,
					amphoe: form.amphoe.value,
					province: form.province.value,
					zipcode: form.zipcode.value,
					student_phone: form.student_phone.value,
					school: form.school.value,
					district1: form.district1.value,
					amphoe1: form.amphoe1.value,
					province1: form.province1.value,
					zipcode1: form.zipcode1.value,
					gpa: form.gpa.value,
					school_type: form.school_type.value,
					disability: form.disability.value,
					father: form.father.value,
					father_occupation: form.father_occupation.value,
					father_phone: form.father_phone.value,
					mother: form.mother.value,
					mother_occupation: form.mother_occupation.value,
					mother_phone: form.mother_phone.value,
					parent: form.parent.value,
					parent_occupation: form.parent_occupation.value,
					parent_phone: form.parent_phone.value,
					relationship: form.relationship.value
	});
									
    fetch(`${url}?${qs}`, {method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)])})
    .then(res => res.json(),setiddoc(),document.getElementById("demo1").reset())
			
    .then(e => console.log(e))
	// <--- You can retrieve the returned value here.
    .catch(err => console.log(err));
  }
});
</script>

<!--สร้างชื่อไฟล์ภาพ -->
<script>
	function setiddoc() {
	var xname = document.getElementById('name').value
	var xlastname = document.getElementById('lastname').value
	document.getElementById('filename').value = "Image_"+xname+" "+xlastname;
	/*-------------------- SweetAlert2 --------------------*/
	Swal.fire({
		position: 'center',
		icon: 'success',
		title: 'สมัครเรียบร้อย',
		showConfirmButton: false,
		timer: 1500
	})
	/*-------------------- ปิด SweetAlert2 ------------------*/
}
</script>
<!-- SweetAlert2 แจ้งเตือนสวยๆ -->
<script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>

<!-- ตรวจสอบเลขบัตรประชาชน -->
<script>
  $(document).ready(function(){
  $('#idcard').on('keyup',function(){
	if($.trim($(this).val()) != '' && $(this).val().length == 13){
	  id = $(this).val().replace(/-/g,"");
	  var result = Script_checkID(id);
	  if(result === false){
		$('span.error').removeClass('true').text('เลขบัตรผิด');
	  }else{
		$('span.error').addClass('true').text('เลขบัตรถูกต้อง');
	  }
	}else{
	  $('span.error').removeClass('true').text('');
	
	}
  })
});

function Script_checkID(id){
	//if(! IsNumeric(id)) return false;
	//if(id.substring(0,1)== 0) return false;
	if(id.length != 13) return false;
	for(i=0, sum=0; i < 12; i++)
		sum += parseFloat(id.charAt(i))*(13-i);
	if((11-sum%11)%10!=parseFloat(id.charAt(12))) return false;
	return true;
}
/*
function IsNumeric(input){
	var RE = /^-?(0|INF|(0[1-7][0-7]*)|(0x[0-9a-fA-F]+)|((0|[1-9][0-9]*|(?=[\.,]))([\.,][0-9]+)?([eE]-?\d+)?))$/;
	return (RE.test(input));
}
*/
</script>

<!-- ปุ่มกลับด้านบน -->
<script>
	var btn = $('#button');

	$(window).scroll(function() {
	  if ($(window).scrollTop() > 300) {
		btn.addClass('show');
	  } else {
		btn.removeClass('show');
	  }
	});

	btn.on('click', function(e) {
	  e.preventDefault();
	  $('html, body').animate({scrollTop:0}, '300');
	});
</script>
  </body>
</html>
	
