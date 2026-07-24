<?php

/**
 * Vercel Serverless Entry Point
 * This forwards requests to Laravel's normal entry point.
 */

// Allow Laravel to store compiled views and caches in /tmp (writable in Vercel)
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';
putenv('VIEW_COMPILED_PATH=/tmp');

require __DIR__ . '/../public/index.php';
