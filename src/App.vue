<script setup>
import dayjs from 'dayjs';
import formatMessage from './utils/i18n';
import { setStorage, getStorage } from './utils/storage';

const week_day = [
  formatMessage('week_day_7'),
  formatMessage('week_day_1'),
  formatMessage('week_day_2'),
  formatMessage('week_day_3'),
  formatMessage('week_day_4'),
  formatMessage('week_day_5'),
  formatMessage('week_day_6'),
];
function formatTimestamp(timestamp) {
  return (timestamp + '').length < 10 ? timestamp * 1000 : timestamp;
}

function formatDigital(number) {
  if (number > 9) {
    return number + '';
  }

  return '0' + number;
}

function formatTimestamp2zoneTime(timestamp, timezone) {
  const unit = document.querySelector('#js_timestamp_unit_o');

  const date = new Date(unit.value === 's' ? +(timestamp * 1000) : +timestamp);
  if (!isNaN(date.getTime())) {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      hour12: false // 使用24小时制
    };

    const formattedDate = new Intl.DateTimeFormat('zh-CN', options).format(date);

    return formattedDate;
  }

  return '';
}

function formatZoneTime2timestamp(dateString, timezone) {
  const unit = document.querySelector('#js_timestamp_unit_o');

  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    // 确保Date对象是按照指定的时区解析的
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    });

    // 格式化日期，确保时区正确
    const formattedDate = formatter.format(date);
    // 再次将格式化后的日期字符串转换为Date对象，以获取正确的时间戳
    const timestampDate = new Date(formattedDate);
    const timestamp = timestampDate.getTime();

    return unit.value === 's' ? timestamp / 1000 : timestamp;
  }

  return '';
}

let digitalClockTimer = null;

function startClock() {
  const h = document.querySelector('#hour-time');
  const m = document.querySelector('#minute-time');
  const s = document.querySelector('#second-time');
  const hour_time = document.querySelector("#hour-line");
  const minute_time = document.querySelector("#minute-line");
  const second_time = document.querySelector("#second-line");
  const data_info = document.querySelector("#date-info");
  const current = document.querySelector("#current");
  const unit = document.querySelector('#js_timestamp_unit_o');
  const timezone = document.querySelector('#js_timezone');
  const now = dayjs().tz(timezone.value);
  const hours = now.hour();
  const minutes = now.minute();
  const seconds = now.second();
  setDigitalClock(h, m, s, hours, minutes, seconds);
  setCalendar(data_info, now);

  setSimulationClock(hour_time, minute_time, second_time, hours, minutes, seconds);
  current.innerHTML = '-';
  digitalClockTimer = setInterval(() => {
    const now = dayjs().tz(timezone.value);

    const hours = now.hour();
    const minutes = now.minute();
    const seconds = now.second();
    setDigitalClock(h, m, s, hours, minutes, seconds);
    setSimulationClock(hour_time, minute_time, second_time, hours, minutes, seconds);
    setCalendar(data_info, now);
    current.innerHTML = unit.value === 's' ? now.unix() : now.valueOf();
  }, 1000);
}

function setDigitalClock(h, m, s, hours, minutes, seconds) {
  h.innerHTML = formatDigital(hours);
  m.innerHTML = formatDigital(minutes);
  s.innerHTML = formatDigital(seconds);
}

function setSimulationClock(hour_time, minute_time, second_time, hours, minutes, seconds) {
  const hour = (hours >= 12) ? (hours - 12) : hours;
  const hour_rotate = (hour * 30 - 90) + (Math.floor(minutes / 12) * 6);

  hour_time.style.transform = 'rotate(' + hour_rotate + 'deg)';
  minute_time.style.transform = 'rotate(' + (minutes * 6 - 90) + 'deg)';
  second_time.style.transform = 'rotate(' + (seconds * 6 - 90) + 'deg)';
}

function setCalendar(date_info, now) {
  const year = now.year();
  const month = now.month() + 1;
  const date = now.date();
  date_info.innerHTML = year + "-" + formatDigital(month) + "-" + formatDigital(date) + " " + week_day[now.day()];
}

window.onload = function () {
  document.querySelector('#js_convert_timestamp').addEventListener('click', function () {
    const timestamp = document.querySelector('#js_timestamp').value;
    const timezone = document.querySelector('#js_timezone').value;
    if (timestamp) {
      document.querySelector('#js_datetime').value = formatTimestamp2zoneTime(timestamp, timezone)
    }
  });

  document.querySelector('#js_convert_datetime').addEventListener('click', function () {
    const time = document.querySelector('#js_time_o').value;
    const timezone = document.querySelector('#js_timezone').value;

    document.querySelector('#js_timestamp_o').value = formatZoneTime2timestamp(time, timezone);
  });

  document.querySelector('#js_timezone').addEventListener('change', function (event) {
    // 这里的函数将在select元素的值变化时执行
    setStorage(event.target.value)
  });

  initNumXY(150, 110, 55, 55);


  getStorage(item => {
    const timezoneStore = item[`clock-timestamp-default`];
    if (timezoneStore) {
      document.querySelector('#js_timezone').value = timezoneStore;
      startClock();

      return;
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.querySelector('#js_timezone').value = timeZone;
    startClock();
  })

}

window.onunload = function () {
  if (digitalClockTimer) {
    clearInterval(digitalClockTimer);
  }
}

function initNumXY(R, r, w, h) {
  let numXY = [
    {
      "left": R + 0.5 * r - 0.5 * w,
      "top": R - 0.5 * r * 1.73205 - 0.5 * h
    },
    {
      "left": R + 0.5 * r * 1.73205 - 0.5 * w,
      "top": R - 0.5 * r - 0.5 * h
    },
    {
      "left": R + r - 0.5 * w,
      "top": R - 0.5 * h
    },
    {
      "left": R + 0.5 * r * 1.73205 - 0.5 * w,
      "top": R + 0.5 * r - 0.5 * h
    },
    {
      "left": R + 0.5 * r - 0.5 * w,
      "top": R + 0.5 * r * 1.732 - 0.5 * h
    },
    {
      "left": R - 0.5 * w,
      "top": R + r - 0.5 * h
    },
    {
      "left": R - 0.5 * r - 0.5 * w,
      "top": R + 0.5 * r * 1.732 - 0.5 * h
    },
    {
      "left": R - 0.5 * r * 1.73205 - 0.5 * w,
      "top": R + 0.5 * r - 0.5 * h
    },
    {
      "left": R - r - 0.5 * w,
      "top": R - 0.5 * h
    },
    {
      "left": R - 0.5 * r * 1.73205 - 0.5 * w,
      "top": R - 0.5 * r - 0.5 * h
    },
    {
      "left": R - 0.5 * r - 0.5 * w,
      "top": R - 0.5 * r * 1.73205 - 0.5 * h
    },
    {
      "left": R - 0.5 * w,
      "top": R - r - 0.5 * h
    }
  ];
  let clock = document.querySelector("#clock");
  for (let i = 1; i <= 12; i++) {
    if (i % 3 == 0) {
      clock.innerHTML += "<div class='clock-num em_num'>" + i + "</div>";
    } else {
      clock.innerHTML += "<div class='clock-num'>" + i + "</div>";
    }
  }
  let clock_num = document.getElementsByClassName("clock-num");
  for (let i = 0; i < clock_num.length; i++) {
    clock_num[i].style.left = numXY[i].left + 'px';
    clock_num[i].style.top = numXY[i].top + 'px';
  }
  for (let i = 0; i < 60; i++) {
    clock.innerHTML += "<div class='clock-scale'> " +
      "<div class='scale-hidden'></div>" +
      "<div class='scale-show'></div>" +
      "</div>";
  }
  let scale = document.getElementsByClassName("clock-scale");
  for (let i = 0; i < scale.length; i++) {
    scale[i].style.transform = "rotate(" + (i * 6 - 90) + "deg)";
  }
}
</script>

<template>
  <main>
    <div class="clock" id="clock">
      <!-- 原点 -->
      <div class="origin"></div>

      <!-- 时分秒针 -->
      <div class="clock-line hour-line" id="hour-line"></div>
      <div class="clock-line minute-line" id="minute-line"></div>
      <div class="clock-line second-line" id="second-line"></div>

      <!-- 日期 -->
      <div class="date-info" id="date-info">--</div>
      <!-- 时间 -->
      <div class="time-info">
        <div class="time" id="hour-time">00</div>
        <div class="time" id="minute-time">00</div>
        <div class="time" id="second-time">00</div>
      </div>
    </div>
    <div class="convert">
      <div class="mb-3">
        <label class="form-label">{{ formatMessage('select_zone') }}</label>
        <div class="form-floating mb-3">
          <select name="timezone" id="js_timezone" class="form-select form-select-md mb-3 fs-sm">
            <option value="Africa/Abidjan">Africa/Abidjan</option>
            <option value="Africa/Accra">Africa/Accra</option>
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="Africa/Algiers">Africa/Algiers</option>
            <option value="Africa/Asmera">Africa/Asmera</option>
            <option value="Africa/Bamako">Africa/Bamako</option>
            <option value="Africa/Bangui">Africa/Bangui</option>
            <option value="Africa/Banjul">Africa/Banjul</option>
            <option value="Africa/Bissau">Africa/Bissau</option>
            <option value="Africa/Blantyre">Africa/Blantyre</option>
            <option value="Africa/Brazzaville">Africa/Brazzaville</option>
            <option value="Africa/Bujumbura">Africa/Bujumbura</option>
            <option value="Africa/Cairo">Africa/Cairo</option>
            <option value="Africa/Casablanca">Africa/Casablanca</option>
            <option value="Africa/Ceuta">Africa/Ceuta</option>
            <option value="Africa/Conakry">Africa/Conakry</option>
            <option value="Africa/Dakar">Africa/Dakar</option>
            <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option>
            <option value="Africa/Djibouti">Africa/Djibouti</option>
            <option value="Africa/Douala">Africa/Douala</option>
            <option value="Africa/El_Aaiun">Africa/El_Aaiun</option>
            <option value="Africa/Freetown">Africa/Freetown</option>
            <option value="Africa/Gaborone">Africa/Gaborone</option>
            <option value="Africa/Harare">Africa/Harare</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg</option>
            <option value="Africa/Juba">Africa/Juba</option>
            <option value="Africa/Kampala">Africa/Kampala</option>
            <option value="Africa/Khartoum">Africa/Khartoum</option>
            <option value="Africa/Kigali">Africa/Kigali</option>
            <option value="Africa/Kinshasa">Africa/Kinshasa</option>
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="Africa/Libreville">Africa/Libreville</option>
            <option value="Africa/Lome">Africa/Lome</option>
            <option value="Africa/Luanda">Africa/Luanda</option>
            <option value="Africa/Lubumbashi">Africa/Lubumbashi</option>
            <option value="Africa/Lusaka">Africa/Lusaka</option>
            <option value="Africa/Malabo">Africa/Malabo</option>
            <option value="Africa/Maputo">Africa/Maputo</option>
            <option value="Africa/Maseru">Africa/Maseru</option>
            <option value="Africa/Mbabane">Africa/Mbabane</option>
            <option value="Africa/Mogadishu">Africa/Mogadishu</option>
            <option value="Africa/Monrovia">Africa/Monrovia</option>
            <option value="Africa/Nairobi">Africa/Nairobi</option>
            <option value="Africa/Ndjamena">Africa/Ndjamena</option>
            <option value="Africa/Niamey">Africa/Niamey</option>
            <option value="Africa/Nouakchott">Africa/Nouakchott</option>
            <option value="Africa/Ouagadougou">Africa/Ouagadougou</option>
            <option value="Africa/Porto-Novo">Africa/Porto-Novo</option>
            <option value="Africa/Sao_Tome">Africa/Sao_Tome</option>
            <option value="Africa/Tripoli">Africa/Tripoli</option>
            <option value="Africa/Tunis">Africa/Tunis</option>
            <option value="Africa/Windhoek">Africa/Windhoek</option>
            <option value="America/Adak">America/Adak</option>
            <option value="America/Anchorage">America/Anchorage</option>
            <option value="America/Anguilla">America/Anguilla</option>
            <option value="America/Antigua">America/Antigua</option>
            <option value="America/Araguaina">America/Araguaina</option>
            <option value="America/Argentina/La_Rioja">America/Argentina/La_Rioja</option>
            <option value="America/Argentina/Rio_Gallegos">America/Argentina/Rio_Gallegos</option>
            <option value="America/Argentina/Salta">America/Argentina/Salta</option>
            <option value="America/Argentina/San_Juan">America/Argentina/San_Juan</option>
            <option value="America/Argentina/San_Luis">America/Argentina/San_Luis</option>
            <option value="America/Argentina/Tucuman">America/Argentina/Tucuman</option>
            <option value="America/Argentina/Ushuaia">America/Argentina/Ushuaia</option>
            <option value="America/Aruba">America/Aruba</option>
            <option value="America/Asuncion">America/Asuncion</option>
            <option value="America/Bahia">America/Bahia</option>
            <option value="America/Bahia_Banderas">America/Bahia_Banderas</option>
            <option value="America/Barbados">America/Barbados</option>
            <option value="America/Belem">America/Belem</option>
            <option value="America/Belize">America/Belize</option>
            <option value="America/Blanc-Sablon">America/Blanc-Sablon</option>
            <option value="America/Boa_Vista">America/Boa_Vista</option>
            <option value="America/Bogota">America/Bogota</option>
            <option value="America/Boise">America/Boise</option>
            <option value="America/Buenos_Aires">America/Buenos_Aires</option>
            <option value="America/Cambridge_Bay">America/Cambridge_Bay</option>
            <option value="America/Campo_Grande">America/Campo_Grande</option>
            <option value="America/Cancun">America/Cancun</option>
            <option value="America/Caracas">America/Caracas</option>
            <option value="America/Catamarca">America/Catamarca</option>
            <option value="America/Cayenne">America/Cayenne</option>
            <option value="America/Cayman">America/Cayman</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/Chihuahua">America/Chihuahua</option>
            <option value="America/Ciudad_Juarez">America/Ciudad_Juarez</option>
            <option value="America/Coral_Harbour">America/Coral_Harbour</option>
            <option value="America/Cordoba">America/Cordoba</option>
            <option value="America/Costa_Rica">America/Costa_Rica</option>
            <option value="America/Creston">America/Creston</option>
            <option value="America/Cuiaba">America/Cuiaba</option>
            <option value="America/Curacao">America/Curacao</option>
            <option value="America/Danmarkshavn">America/Danmarkshavn</option>
            <option value="America/Dawson">America/Dawson</option>
            <option value="America/Dawson_Creek">America/Dawson_Creek</option>
            <option value="America/Denver">America/Denver</option>
            <option value="America/Detroit">America/Detroit</option>
            <option value="America/Dominica">America/Dominica</option>
            <option value="America/Edmonton">America/Edmonton</option>
            <option value="America/Eirunepe">America/Eirunepe</option>
            <option value="America/El_Salvador">America/El_Salvador</option>
            <option value="America/Fort_Nelson">America/Fort_Nelson</option>
            <option value="America/Fortaleza">America/Fortaleza</option>
            <option value="America/Glace_Bay">America/Glace_Bay</option>
            <option value="America/Godthab">America/Godthab</option>
            <option value="America/Goose_Bay">America/Goose_Bay</option>
            <option value="America/Grand_Turk">America/Grand_Turk</option>
            <option value="America/Grenada">America/Grenada</option>
            <option value="America/Guadeloupe">America/Guadeloupe</option>
            <option value="America/Guatemala">America/Guatemala</option>
            <option value="America/Guayaquil">America/Guayaquil</option>
            <option value="America/Guyana">America/Guyana</option>
            <option value="America/Halifax">America/Halifax</option>
            <option value="America/Havana">America/Havana</option>
            <option value="America/Hermosillo">America/Hermosillo</option>
            <option value="America/Indiana/Knox">America/Indiana/Knox</option>
            <option value="America/Indiana/Marengo">America/Indiana/Marengo</option>
            <option value="America/Indiana/Petersburg">America/Indiana/Petersburg</option>
            <option value="America/Indiana/Tell_City">America/Indiana/Tell_City</option>
            <option value="America/Indiana/Vevay">America/Indiana/Vevay</option>
            <option value="America/Indiana/Vincennes">America/Indiana/Vincennes</option>
            <option value="America/Indiana/Winamac">America/Indiana/Winamac</option>
            <option value="America/Indianapolis">America/Indianapolis</option>
            <option value="America/Inuvik">America/Inuvik</option>
            <option value="America/Iqaluit">America/Iqaluit</option>
            <option value="America/Jamaica">America/Jamaica</option>
            <option value="America/Jujuy">America/Jujuy</option>
            <option value="America/Juneau">America/Juneau</option>
            <option value="America/Kentucky/Monticello">America/Kentucky/Monticello</option>
            <option value="America/Kralendijk">America/Kralendijk</option>
            <option value="America/La_Paz">America/La_Paz</option>
            <option value="America/Lima">America/Lima</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="America/Louisville">America/Louisville</option>
            <option value="America/Lower_Princes">America/Lower_Princes</option>
            <option value="America/Maceio">America/Maceio</option>
            <option value="America/Managua">America/Managua</option>
            <option value="America/Manaus">America/Manaus</option>
            <option value="America/Marigot">America/Marigot</option>
            <option value="America/Martinique">America/Martinique</option>
            <option value="America/Matamoros">America/Matamoros</option>
            <option value="America/Mazatlan">America/Mazatlan</option>
            <option value="America/Mendoza">America/Mendoza</option>
            <option value="America/Menominee">America/Menominee</option>
            <option value="America/Merida">America/Merida</option>
            <option value="America/Metlakatla">America/Metlakatla</option>
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="America/Miquelon">America/Miquelon</option>
            <option value="America/Moncton">America/Moncton</option>
            <option value="America/Monterrey">America/Monterrey</option>
            <option value="America/Montevideo">America/Montevideo</option>
            <option value="America/Montserrat">America/Montserrat</option>
            <option value="America/Nassau">America/Nassau</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Nome">America/Nome</option>
            <option value="America/Noronha">America/Noronha</option>
            <option value="America/North_Dakota/Beulah">America/North_Dakota/Beulah</option>
            <option value="America/North_Dakota/Center">America/North_Dakota/Center</option>
            <option value="America/North_Dakota/New_Salem">America/North_Dakota/New_Salem</option>
            <option value="America/Ojinaga">America/Ojinaga</option>
            <option value="America/Panama">America/Panama</option>
            <option value="America/Paramaribo">America/Paramaribo</option>
            <option value="America/Phoenix">America/Phoenix</option>
            <option value="America/Port-au-Prince">America/Port-au-Prince</option>
            <option value="America/Port_of_Spain">America/Port_of_Spain</option>
            <option value="America/Porto_Velho">America/Porto_Velho</option>
            <option value="America/Puerto_Rico">America/Puerto_Rico</option>
            <option value="America/Punta_Arenas">America/Punta_Arenas</option>
            <option value="America/Rankin_Inlet">America/Rankin_Inlet</option>
            <option value="America/Recife">America/Recife</option>
            <option value="America/Regina">America/Regina</option>
            <option value="America/Resolute">America/Resolute</option>
            <option value="America/Rio_Branco">America/Rio_Branco</option>
            <option value="America/Santarem">America/Santarem</option>
            <option value="America/Santiago">America/Santiago</option>
            <option value="America/Santo_Domingo">America/Santo_Domingo</option>
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
            <option value="America/Scoresbysund">America/Scoresbysund</option>
            <option value="America/Sitka">America/Sitka</option>
            <option value="America/St_Barthelemy">America/St_Barthelemy</option>
            <option value="America/St_Johns">America/St_Johns</option>
            <option value="America/St_Kitts">America/St_Kitts</option>
            <option value="America/St_Lucia">America/St_Lucia</option>
            <option value="America/St_Thomas">America/St_Thomas</option>
            <option value="America/St_Vincent">America/St_Vincent</option>
            <option value="America/Swift_Current">America/Swift_Current</option>
            <option value="America/Tegucigalpa">America/Tegucigalpa</option>
            <option value="America/Thule">America/Thule</option>
            <option value="America/Tijuana">America/Tijuana</option>
            <option value="America/Toronto">America/Toronto</option>
            <option value="America/Tortola">America/Tortola</option>
            <option value="America/Vancouver">America/Vancouver</option>
            <option value="America/Whitehorse">America/Whitehorse</option>
            <option value="America/Winnipeg">America/Winnipeg</option>
            <option value="America/Yakutat">America/Yakutat</option>
            <option value="Antarctica/Casey">Antarctica/Casey</option>
            <option value="Antarctica/Davis">Antarctica/Davis</option>
            <option value="Antarctica/DumontDUrville">Antarctica/DumontDUrville</option>
            <option value="Antarctica/Macquarie">Antarctica/Macquarie</option>
            <option value="Antarctica/Mawson">Antarctica/Mawson</option>
            <option value="Antarctica/McMurdo">Antarctica/McMurdo</option>
            <option value="Antarctica/Palmer">Antarctica/Palmer</option>
            <option value="Antarctica/Rothera">Antarctica/Rothera</option>
            <option value="Antarctica/Syowa">Antarctica/Syowa</option>
            <option value="Antarctica/Troll">Antarctica/Troll</option>
            <option value="Antarctica/Vostok">Antarctica/Vostok</option>
            <option value="Arctic/Longyearbyen">Arctic/Longyearbyen</option>
            <option value="Asia/Aden">Asia/Aden</option>
            <option value="Asia/Almaty">Asia/Almaty</option>
            <option value="Asia/Amman">Asia/Amman</option>
            <option value="Asia/Anadyr">Asia/Anadyr</option>
            <option value="Asia/Aqtau">Asia/Aqtau</option>
            <option value="Asia/Aqtobe">Asia/Aqtobe</option>
            <option value="Asia/Ashgabat">Asia/Ashgabat</option>
            <option value="Asia/Atyrau">Asia/Atyrau</option>
            <option value="Asia/Baghdad">Asia/Baghdad</option>
            <option value="Asia/Bahrain">Asia/Bahrain</option>
            <option value="Asia/Baku">Asia/Baku</option>
            <option value="Asia/Bangkok">Asia/Bangkok</option>
            <option value="Asia/Barnaul">Asia/Barnaul</option>
            <option value="Asia/Beirut">Asia/Beirut</option>
            <option value="Asia/Bishkek">Asia/Bishkek</option>
            <option value="Asia/Brunei">Asia/Brunei</option>
            <option value="Asia/Calcutta">Asia/Calcutta</option>
            <option value="Asia/Chita">Asia/Chita</option>
            <option value="Asia/Choibalsan">Asia/Choibalsan</option>
            <option value="Asia/Colombo">Asia/Colombo</option>
            <option value="Asia/Damascus">Asia/Damascus</option>
            <option value="Asia/Dhaka">Asia/Dhaka</option>
            <option value="Asia/Dili">Asia/Dili</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Asia/Dushanbe">Asia/Dushanbe</option>
            <option value="Asia/Famagusta">Asia/Famagusta</option>
            <option value="Asia/Gaza">Asia/Gaza</option>
            <option value="Asia/Hebron">Asia/Hebron</option>
            <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
            <option value="Asia/Hovd">Asia/Hovd</option>
            <option value="Asia/Irkutsk">Asia/Irkutsk</option>
            <option value="Asia/Jakarta">Asia/Jakarta</option>
            <option value="Asia/Jayapura">Asia/Jayapura</option>
            <option value="Asia/Jerusalem">Asia/Jerusalem</option>
            <option value="Asia/Kabul">Asia/Kabul</option>
            <option value="Asia/Kamchatka">Asia/Kamchatka</option>
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="Asia/Katmandu">Asia/Katmandu</option>
            <option value="Asia/Khandyga">Asia/Khandyga</option>
            <option value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</option>
            <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
            <option value="Asia/Kuching">Asia/Kuching</option>
            <option value="Asia/Kuwait">Asia/Kuwait</option>
            <option value="Asia/Macau">Asia/Macau</option>
            <option value="Asia/Magadan">Asia/Magadan</option>
            <option value="Asia/Makassar">Asia/Makassar</option>
            <option value="Asia/Manila">Asia/Manila</option>
            <option value="Asia/Muscat">Asia/Muscat</option>
            <option value="Asia/Nicosia">Asia/Nicosia</option>
            <option value="Asia/Novokuznetsk">Asia/Novokuznetsk</option>
            <option value="Asia/Novosibirsk">Asia/Novosibirsk</option>
            <option value="Asia/Omsk">Asia/Omsk</option>
            <option value="Asia/Oral">Asia/Oral</option>
            <option value="Asia/Phnom_Penh">Asia/Phnom_Penh</option>
            <option value="Asia/Pontianak">Asia/Pontianak</option>
            <option value="Asia/Pyongyang">Asia/Pyongyang</option>
            <option value="Asia/Qatar">Asia/Qatar</option>
            <option value="Asia/Qostanay">Asia/Qostanay</option>
            <option value="Asia/Qyzylorda">Asia/Qyzylorda</option>
            <option value="Asia/Rangoon">Asia/Rangoon</option>
            <option value="Asia/Riyadh">Asia/Riyadh</option>
            <option value="Asia/Saigon">Asia/Saigon</option>
            <option value="Asia/Sakhalin">Asia/Sakhalin</option>
            <option value="Asia/Samarkand">Asia/Samarkand</option>
            <option value="Asia/Seoul">Asia/Seoul</option>
            <option value="Asia/Shanghai">Asia/Shanghai</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
            <option value="Asia/Srednekolymsk">Asia/Srednekolymsk</option>
            <option value="Asia/Taipei">Asia/Taipei</option>
            <option value="Asia/Tashkent">Asia/Tashkent</option>
            <option value="Asia/Tbilisi">Asia/Tbilisi</option>
            <option value="Asia/Tehran">Asia/Tehran</option>
            <option value="Asia/Thimphu">Asia/Thimphu</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="Asia/Tomsk">Asia/Tomsk</option>
            <option value="Asia/Ulaanbaatar">Asia/Ulaanbaatar</option>
            <option value="Asia/Urumqi">Asia/Urumqi</option>
            <option value="Asia/Ust-Nera">Asia/Ust-Nera</option>
            <option value="Asia/Vientiane">Asia/Vientiane</option>
            <option value="Asia/Vladivostok">Asia/Vladivostok</option>
            <option value="Asia/Yakutsk">Asia/Yakutsk</option>
            <option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option>
            <option value="Asia/Yerevan">Asia/Yerevan</option>
            <option value="Atlantic/Azores">Atlantic/Azores</option>
            <option value="Atlantic/Bermuda">Atlantic/Bermuda</option>
            <option value="Atlantic/Canary">Atlantic/Canary</option>
            <option value="Atlantic/Cape_Verde">Atlantic/Cape_Verde</option>
            <option value="Atlantic/Faeroe">Atlantic/Faeroe</option>
            <option value="Atlantic/Madeira">Atlantic/Madeira</option>
            <option value="Atlantic/Reykjavik">Atlantic/Reykjavik</option>
            <option value="Atlantic/South_Georgia">Atlantic/South_Georgia</option>
            <option value="Atlantic/St_Helena">Atlantic/St_Helena</option>
            <option value="Atlantic/Stanley">Atlantic/Stanley</option>
            <option value="Australia/Adelaide">Australia/Adelaide</option>
            <option value="Australia/Brisbane">Australia/Brisbane</option>
            <option value="Australia/Broken_Hill">Australia/Broken_Hill</option>
            <option value="Australia/Darwin">Australia/Darwin</option>
            <option value="Australia/Eucla">Australia/Eucla</option>
            <option value="Australia/Hobart">Australia/Hobart</option>
            <option value="Australia/Lindeman">Australia/Lindeman</option>
            <option value="Australia/Lord_Howe">Australia/Lord_Howe</option>
            <option value="Australia/Melbourne">Australia/Melbourne</option>
            <option value="Australia/Perth">Australia/Perth</option>
            <option value="Australia/Sydney">Australia/Sydney</option>
            <option value="Europe/Amsterdam">Europe/Amsterdam</option>
            <option value="Europe/Andorra">Europe/Andorra</option>
            <option value="Europe/Astrakhan">Europe/Astrakhan</option>
            <option value="Europe/Athens">Europe/Athens</option>
            <option value="Europe/Belgrade">Europe/Belgrade</option>
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="Europe/Bratislava">Europe/Bratislava</option>
            <option value="Europe/Brussels">Europe/Brussels</option>
            <option value="Europe/Bucharest">Europe/Bucharest</option>
            <option value="Europe/Budapest">Europe/Budapest</option>
            <option value="Europe/Busingen">Europe/Busingen</option>
            <option value="Europe/Chisinau">Europe/Chisinau</option>
            <option value="Europe/Copenhagen">Europe/Copenhagen</option>
            <option value="Europe/Dublin">Europe/Dublin</option>
            <option value="Europe/Gibraltar">Europe/Gibraltar</option>
            <option value="Europe/Guernsey">Europe/Guernsey</option>
            <option value="Europe/Helsinki">Europe/Helsinki</option>
            <option value="Europe/Isle_of_Man">Europe/Isle_of_Man</option>
            <option value="Europe/Istanbul">Europe/Istanbul</option>
            <option value="Europe/Jersey">Europe/Jersey</option>
            <option value="Europe/Kaliningrad">Europe/Kaliningrad</option>
            <option value="Europe/Kiev">Europe/Kiev</option>
            <option value="Europe/Kirov">Europe/Kirov</option>
            <option value="Europe/Lisbon">Europe/Lisbon</option>
            <option value="Europe/Ljubljana">Europe/Ljubljana</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Luxembourg">Europe/Luxembourg</option>
            <option value="Europe/Madrid">Europe/Madrid</option>
            <option value="Europe/Malta">Europe/Malta</option>
            <option value="Europe/Mariehamn">Europe/Mariehamn</option>
            <option value="Europe/Minsk">Europe/Minsk</option>
            <option value="Europe/Monaco">Europe/Monaco</option>
            <option value="Europe/Moscow">Europe/Moscow</option>
            <option value="Europe/Oslo">Europe/Oslo</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Europe/Podgorica">Europe/Podgorica</option>
            <option value="Europe/Prague">Europe/Prague</option>
            <option value="Europe/Riga">Europe/Riga</option>
            <option value="Europe/Rome">Europe/Rome</option>
            <option value="Europe/Samara">Europe/Samara</option>
            <option value="Europe/San_Marino">Europe/San_Marino</option>
            <option value="Europe/Sarajevo">Europe/Sarajevo</option>
            <option value="Europe/Saratov">Europe/Saratov</option>
            <option value="Europe/Simferopol">Europe/Simferopol</option>
            <option value="Europe/Skopje">Europe/Skopje</option>
            <option value="Europe/Sofia">Europe/Sofia</option>
            <option value="Europe/Stockholm">Europe/Stockholm</option>
            <option value="Europe/Tallinn">Europe/Tallinn</option>
            <option value="Europe/Tirane">Europe/Tirane</option>
            <option value="Europe/Ulyanovsk">Europe/Ulyanovsk</option>
            <option value="Europe/Vaduz">Europe/Vaduz</option>
            <option value="Europe/Vatican">Europe/Vatican</option>
            <option value="Europe/Vienna">Europe/Vienna</option>
            <option value="Europe/Vilnius">Europe/Vilnius</option>
            <option value="Europe/Volgograd">Europe/Volgograd</option>
            <option value="Europe/Warsaw">Europe/Warsaw</option>
            <option value="Europe/Zagreb">Europe/Zagreb</option>
            <option value="Europe/Zurich">Europe/Zurich</option>
            <option value="Indian/Antananarivo">Indian/Antananarivo</option>
            <option value="Indian/Chagos">Indian/Chagos</option>
            <option value="Indian/Christmas">Indian/Christmas</option>
            <option value="Indian/Cocos">Indian/Cocos</option>
            <option value="Indian/Comoro">Indian/Comoro</option>
            <option value="Indian/Kerguelen">Indian/Kerguelen</option>
            <option value="Indian/Mahe">Indian/Mahe</option>
            <option value="Indian/Maldives">Indian/Maldives</option>
            <option value="Indian/Mauritius">Indian/Mauritius</option>
            <option value="Indian/Mayotte">Indian/Mayotte</option>
            <option value="Indian/Reunion">Indian/Reunion</option>
            <option value="Pacific/Apia">Pacific/Apia</option>
            <option value="Pacific/Auckland">Pacific/Auckland</option>
            <option value="Pacific/Bougainville">Pacific/Bougainville</option>
            <option value="Pacific/Chatham">Pacific/Chatham</option>
            <option value="Pacific/Easter">Pacific/Easter</option>
            <option value="Pacific/Efate">Pacific/Efate</option>
            <option value="Pacific/Enderbury">Pacific/Enderbury</option>
            <option value="Pacific/Fakaofo">Pacific/Fakaofo</option>
            <option value="Pacific/Fiji">Pacific/Fiji</option>
            <option value="Pacific/Funafuti">Pacific/Funafuti</option>
            <option value="Pacific/Galapagos">Pacific/Galapagos</option>
            <option value="Pacific/Gambier">Pacific/Gambier</option>
            <option value="Pacific/Guadalcanal">Pacific/Guadalcanal</option>
            <option value="Pacific/Guam">Pacific/Guam</option>
            <option value="Pacific/Honolulu">Pacific/Honolulu</option>
            <option value="Pacific/Kiritimati">Pacific/Kiritimati</option>
            <option value="Pacific/Kosrae">Pacific/Kosrae</option>
            <option value="Pacific/Kwajalein">Pacific/Kwajalein</option>
            <option value="Pacific/Majuro">Pacific/Majuro</option>
            <option value="Pacific/Marquesas">Pacific/Marquesas</option>
            <option value="Pacific/Midway">Pacific/Midway</option>
            <option value="Pacific/Nauru">Pacific/Nauru</option>
            <option value="Pacific/Niue">Pacific/Niue</option>
            <option value="Pacific/Norfolk">Pacific/Norfolk</option>
            <option value="Pacific/Noumea">Pacific/Noumea</option>
            <option value="Pacific/Pago_Pago">Pacific/Pago_Pago</option>
            <option value="Pacific/Palau">Pacific/Palau</option>
            <option value="Pacific/Pitcairn">Pacific/Pitcairn</option>
            <option value="Pacific/Ponape">Pacific/Ponape</option>
            <option value="Pacific/Port_Moresby">Pacific/Port_Moresby</option>
            <option value="Pacific/Rarotonga">Pacific/Rarotonga</option>
            <option value="Pacific/Saipan">Pacific/Saipan</option>
            <option value="Pacific/Tahiti">Pacific/Tahiti</option>
            <option value="Pacific/Tarawa">Pacific/Tarawa</option>
            <option value="Pacific/Tongatapu">Pacific/Tongatapu</option>
            <option value="Pacific/Truk">Pacific/Truk</option>
            <option value="Pacific/Wake">Pacific/Wake</option>
            <option value="Pacific/Wallis">Pacific/Wallis</option>
          </select>
          <label for="js_timezone">{{ formatMessage('zone') }}</label>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">{{ formatMessage('select_timestamp_type') }}</label>
        <div class="form-floating mb-3">
          <select id="js_timestamp_unit_o" class="form-select form-select-md mb-3 fs-sm">
            <option value="s">{{ formatMessage('second') }}</option>
            <option value="ms">{{ formatMessage('millsecond') }}</option>
          </select>
          <label for="js_timestamp_unit_o">{{ formatMessage('timestamp_type') }}</label>
        </div>
      </div>

      <hr />

      <div class="mb-3">
        <label class="form-label">
          {{ formatMessage('timestamp_2_time') }}
          ({{ formatMessage('current') }}: <span id="current"></span>)
        </label>
        <div class="row">
          <div class="col flex-grow">
            <div class="form-floating">
              <input type="text" class="form-control" id="js_timestamp" placeholder="timestamp" />
              <label for="js_timestamp">{{ formatMessage('timestamp') }}</label>
            </div>
          </div>
          <div class="col flex-btn">
            <button id="js_convert_timestamp" type="button" class="btn btn-primary">{{ formatMessage('convert') }}
              ›</button>
          </div>
          <div class="col flex-grow">
            <div class="form-floating">
              <input type="text" readonly class="form-control" id="js_datetime" placeholder="datetime" />
              <label for="js_datetime">{{ formatMessage('result') }}</label>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          {{ formatMessage('time_2_timestamp') }}
        </label>
        <div class="row">
          <div class="col flex-grow">
            <div class="form-floating">
              <input type="datetime-local" step="1" id="js_time_o" class="form-control">
              <label for="js_datetime_o">{{ formatMessage('time') }}</label>
            </div>
          </div>
          <div class="col flex-btn">
            <button id="js_convert_datetime" type="button" class="btn btn-primary">{{ formatMessage('convert') }}
              ›</button>
          </div>
          <div class="col flex-grow">
            <div class="form-floating">
              <input type="text" readonly class="form-control" id="js_timestamp_o" placeholder="" />
              <label for="js_timestamp_o">{{ formatMessage('result') }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 24px;
  padding-left: 12px;
  font-size: 16px;
}

main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

p {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

hr {
  color: #ccc !important;
}

input,
select {
  font-size: 14px !important;
}

/* 全局 */
* {
  margin: 0;
  padding: 0;
}

.clock {
  width: 300px;
  height: 300px;
  border: 10px solid #333;
  box-shadow: 0px 0px 12px 3px #444 inset;
  border-radius: 210px;
  position: relative;
  margin: 5px auto;
  z-index: 10;
  background-color: #f6f6f6;
  flex-shrink: 0;
  transform: scale(0.9);
}

/* 时钟数字 */
.clock-num {
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  position: absolute;
  z-index: 8;
  color: #555;
  font-family: monospace;
}

.em_num {
  font-size: 28px;
}

/* 指针 */
.clock-line {
  position: absolute;
  z-index: 20;
}

.hour-line {
  width: 100px;
  height: 4px;
  top: 140px;
  left: 140px;
  background-color: #000;
  border-radius: 2px;
  transform-origin: 0 50%;
  box-shadow: 1px -3px 8px 3px #aaa;
}

.minute-line {
  width: 120px;
  height: 2px;
  top: 140px;
  left: 140px;
  background-color: #000;
  transform-origin: 0 50%;
  box-shadow: 1px -3px 8px 1px #aaa;
}

.second-line {
  width: 130px;
  height: 1px;
  top: 140px;
  left: 140px;
  background-color: #f60;
  transform-origin: 0 50%;
  box-shadow: 1px -3px 7px 1px #bbb;
}

/* 原点 */
.origin {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #000;
  position: absolute;
  top: 130px;
  left: 130px;
  z-index: 14;
}

/* 日期 时间 */
.date-info {
  width: 160px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  position: absolute;
  font-size: 14px;
  top: 80px;
  left: 65px;
  z-index: 11;
  color: #555;
  font-weight: bold;
  font-family: 'monospace';
}

.time-info {
  width: 92px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  position: absolute;
  top: 170px;
  left: 100px;
  z-index: 11;
  background-color: #555;
  padding: 0;
  box-shadow: 0px 0px 9px 2px #222 inset;
}

.time {
  width: 30px;
  height: 30px;
  text-align: center;
  float: left;
  color: #fff;
  font-weight: bold;
}

#minute-time {
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
}

/* 刻度 */
.clock-scale {
  width: 160px;
  height: 2px;
  transform-origin: 0% 50%;
  z-index: 7;
  position: absolute;
  top: 140px;
  left: 140px;
}

.scale-show {
  width: 12px;
  height: 2px;
  background-color: #555;
  float: left;
}

.scale-hidden {
  width: 130px;
  height: 2px;
  float: left;
}

.convert {
  font-size: 14px;
}

.fs-sm {
  font-size: 14px;
}

.flex-btn {
  text-align: center;
  white-space: nowrap;
  padding: 0 !important;
  flex-grow: 0;
  flex: 0 !important;
}

.row {
  align-items: center;
}
</style>
