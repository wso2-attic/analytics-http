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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import ua_parser.Parser;

import java.io.IOException;

/**
 * This class initializes ua-parser which is used to resolve user agent HTTP header.
 */
public class UserAgentResolverInitializer {

    private static final Log log = LogFactory.getLog(UserAgentResolverInitializer.class);
    private static UserAgentResolverInitializer userAgentResolverInitializer = new UserAgentResolverInitializer();
    private static Parser parser;

    private UserAgentResolverInitializer() {
        try {
            parser = new Parser();
        } catch (IOException e) {
            log.error("Unable to initialize the user agent parser", e);
        }
    }

    public static UserAgentResolverInitializer getInstance() {
        return userAgentResolverInitializer;
    }

    public Parser getUaParser() {
        return parser;
    }
}
