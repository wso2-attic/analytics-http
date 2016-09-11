package org.wso2.analytics.http.udf;

/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import com.maxmind.db.CHMCache;
import com.maxmind.geoip2.DatabaseReader;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.utils.CarbonUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * This class initializes MaxMind GeoIP2 with GeoLite2.
 */
public class GeoLocationResolverInitializer {

    private static final Log log = LogFactory.getLog(GeoLocationResolverInitializer.class);
    private static final String GEOLITE2_COUNTRY_DB_FILENAME = "GeoLite2-Country.mmdb";
    private static GeoLocationResolverInitializer geoLocationResolverInitializer = new GeoLocationResolverInitializer();
    private static DatabaseReader databaseReader;

    private GeoLocationResolverInitializer() {
        Path geolite2DBPath = Paths.get(CarbonUtils.getCarbonHome(), "repository", "resources",
                GEOLITE2_COUNTRY_DB_FILENAME);
        if (Files.exists(geolite2DBPath)) {
            try {
                databaseReader = new DatabaseReader.Builder(geolite2DBPath.toFile()).withCache(new CHMCache()).build();
            } catch (IOException e) {
                log.warn("Couldn't read repository/resources/" + GEOLITE2_COUNTRY_DB_FILENAME);
            }
        } else {
            log.warn("Couldn't find " + GEOLITE2_COUNTRY_DB_FILENAME + " file in repository/resources/");
        }
    }

    public static GeoLocationResolverInitializer getInstance() {
        return geoLocationResolverInitializer;
    }

    public DatabaseReader getDatabaseReader() {
        return databaseReader;
    }
}
