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

import org.wso2.carbon.analytics.spark.core.udf.CarbonUDF;
import ua_parser.*;

/**
 * This UDF is to resolve browser, operating system and device type from user agent HTTP header.
 *
 * @since 6.0.0
 */
public class UserAgentResolverUDF implements CarbonUDF {

    /**
     * Gets the user agent family from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the user agent family
     */
    public String extractUserAgentFamily(String uaString) {
        Parser parser = UserAgentResolverInitializer.getInstance().getUaParser();
        if (parser != null) {
            UserAgent userAgent = parser.parseUserAgent(uaString);
            if (userAgent != null) {
                return userAgent.family;
            }
        }
        return null;
    }


    /**
     * Gets the operating system from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the operating system
     */
    public String extractOSFamily(String uaString) {
        Parser parser = UserAgentResolverInitializer.getInstance().getUaParser();
        if (parser != null) {
            OS os = parser.parseOS(uaString);
            if (os != null) {
                return os.family;
            }
        }
        return null;
    }

    /**
     * Gets the device type from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the device type
     */
    public String extractDeviceFamily(String uaString) {
        Parser parser = UserAgentResolverInitializer.getInstance().getUaParser();
        if (parser != null) {
            Device device = parser.parseDevice(uaString);
            if (device != null) {
                return device.family;
            }
        }
        return null;
    }
}
