package org.wso2.carbon.analytics.http.udf;
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

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import org.wso2.carbon.analytics.spark.core.udf.CarbonUDF;

import java.io.IOException;
import java.net.InetAddress;

/**
 * This class uses the MaxMind GeoIP2-java API to resolve client IPs to geo locations.
 * <p>
 * This implementation supports only the GeoLite2 Country database. At the initialization
 * it checks whether the country database file is available at repository/resources.
 */
public class GeoLocationResolverUDF implements CarbonUDF {

    /**
     * Returns the country of the given ip address.
     *
     * @param ipAddress ip address
     * @return returns the name of the country
     */
    public String getCountry(String ipAddress) throws IOException {
        DatabaseReader databaseReader = GeoLocationResolverInitializer.getInstance().getDatabaseReader();
        if (databaseReader != null) {
            InetAddress inetAddress = InetAddress.getByName(ipAddress);
            try {
                String country = databaseReader.country(inetAddress).getCountry().getName();
                if (country != null) {
                    return country;
                }
            } catch (GeoIp2Exception e) {
                return null;
            }
        }
        return null;
    }
}
