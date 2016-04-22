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

import ua_parser.Client;
import ua_parser.Parser;

import java.io.IOException;

/**
 * This is an implementation of ua Parser Java Library
 * to extract user agent information from a given
 * user agent string.
 *
 * @since 6.0.0
 */
public class UserAgentSplitter {
    Parser uaParser;


    public UserAgentSplitter() throws IOException {
        uaParser = new Parser();
    }

    /**
     * Gets the user agent family from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the user agent family
     */
    public String extractUserAgentFamily(String uaString) {
        Client c = uaParser.parse(uaString);
        return c.userAgent.family;
    }


    /**
     * Gets the operating system from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the operating system
     */
    public String extractOSFamily(String uaString) {
        Client c = uaParser.parse(uaString);
        return c.os.family;
    }

    /**
     * Gets the device type from given user agent string.
     *
     * @param uaString the user agent header to be processed
     * @return the device type
     */
    public String extractDeviceFamily(String uaString) {
        Client c = uaParser.parse(uaString);
        return c.device.family;
    }
}
