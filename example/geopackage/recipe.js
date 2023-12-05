const db = await gpkg.loadAndCache(
    "play",
    "./data/org_units-2023-11-28-17-03.gpkg.zip",
  );
  
  let results = [];
    results = await db.exec(`
    select 
      json_extract(json,'$."de388__15y"') as "de388__15y", 
      period, submissions.name , org_unit_id ,  
      CASE 
        WHEN json_extract(json,'$."de388__15y"') < 4 THEN'#0000ZZ'
        WHEN json_extract(json,'$."de388__15y"') >= 4 THEN'#FF0000'
        else '#aaaaaa'
      END  as color,
      facilities.name as facility_name, facilities.geom as geom
      from submissions join "level-4-Facility" as facilities on facilities.id = submissions.org_unit_id 
      order by period, submissions.name`).get.objs;
  
    // show the district on the same map
    results = results.concat(
      await db.exec('SELECT * FROM "level-2-District"').get.objs,
    );
  
  return results